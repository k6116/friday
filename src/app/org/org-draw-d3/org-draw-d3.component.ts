import { Component, OnInit, OnChanges, Input } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-org-draw-d3',
  templateUrl: './org-draw-d3.component.html',
  styleUrls: ['./org-draw-d3.component.css', '../../_shared/styles/common.css']
})
export class OrgDrawD3Component implements OnInit, OnChanges {

  @Input() orgJson: any;

  partDeptLegend: any;  // for storing d3 legend data

  constructor() { }

  ngOnInit() {
    // listen for changes to window size, and redraw the BOM chart if it changes
    window.addEventListener('resize', () => {
      this.drawD3Plot(this.orgJson);
    });
  }

  ngOnChanges() {

    // when bomJson input binding changes value, parse data for the legend and draw the chart
    if (this.orgJson) {
      // draw the BOM chart
      this.drawD3Plot(this.orgJson);
    }

  }

  drawD3Plot(bomJson: any) {
    // kill any existing drawings, if any
    d3.select('#d3-container').selectAll('*').remove();

    const nodeSize = {height: 28, width: 200};
    const aspect = (window.innerWidth - 180) / (window.innerHeight - 70); // calculate aspect ratio, including side and top nav
    const height = 0.75 * window.innerHeight;
    const width = height * aspect;
    const zoomSpeed = 1700; // some number between 400 and 2000
    // set start position/scale of drawing, and size of nodes (to set default node spacing)
    const initialTransform = d3.zoomIdentity.translate(width / 2, 50).scale(.9);

    // HELPER FUNCTIONS //
    function collapseNode(d) {
      // recursively collapse a node and all its children
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapseNode);
        d.children = null;
      }
    }

    function expandNode(d) {
      // recursively expand a node and all its children
      if (d._children) {
        d.children = d._children;
        d._children = null;
      }
      if (d.children) {
        d.children.forEach(expandNode);
      }
    }

    // recursively collapses a node and all its children if it is not called out to be expanded by default
    function initialCollapse(d) {
      if (d.data.defaultCollapsed) {
        collapseNode(d);
      } else if (d.children) {
        d.children.forEach(initialCollapse);
      }
    }

    // set custom zoom settings
    const zoom = d3.zoom()
      .scaleExtent([0.09, 4])  // restrict zoom to this scale range
      .wheelDelta(() => { // custom wheel delta function to reduce zoom speed
        return -d3.event.deltaY * (d3.event.deltaMode ? 120 : 1) / zoomSpeed;
      })
      .on('zoom', () => {
        // when zoomed, actually perform the transform on the 'svg' object using d3.event.transform
        svg.attr('transform', d3.event.transform);
      });

    // padding-bottom trick to make the container padding match the SVG height
    const wrapper = d3.select('#d3-container')
      .attr('style', `padding-bottom:${Math.ceil(height * 100 / width)}%`);

    // append the svg object to the body of the page and appends a 'group' container element to 'svg'
    const svg = d3.select('#d3-container').append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g');

    // define a zoom function for the SVG, and an initial transform for the zoom
    // if you don't set the initial transform using the defined zoom function, it will 'snap' back to the origin on first move
    d3.select('#d3-container').select('svg')
      .call(zoom) // adds zoom functionality
      .call(zoom.transform, initialTransform);  // applies initial transform

    // declares a tree layout and assigns the size
    const treemap = d3.tree().nodeSize([nodeSize.width, nodeSize.height]);

    // Assigns data for root node, and the starting location of the root node
    const root = d3.hierarchy(bomJson);
    root.x0 = 0;
    root.y0 = 0;

    // set index counter for node ID assignment
    let i = 1;
    root.children.forEach(initialCollapse);
    update(root);

    // TOOLBAR BUTTONS

    // add toolbar button functionality for expand all nodes
    d3.select('#expandAll')
    .on('click', () => {
      expandNode(root);
      update(root);
    });

    // add toolbar functionality for reset collapse to
    d3.select('#defaultCollapse')
    .on('click', () => {
      // first, expand all nodes, then apply the initial collapse
      expandNode(root);
      root.children.forEach(initialCollapse);
      update(root);
      d3.select('#d3-container').select('svg')
      .call(zoom) // adds zoom functionality
      .call(zoom.transform, initialTransform);  // applies initial transform
    });

    function update(source) {

      // --- SETTINGS --- //
      const treeLevelSeparation = 280;  // horizontal spacing between tiers/levels of the BOM tree
      const collapseAnimSpeed = 750;
      const tooltipAnimSpeed = 100;
      const rectXpos = -8;
      const rectYpos = -11;
      const rectBorderRadius = 4;
      const rectHeight = 20;
      const textHeight = rectHeight - 5;  // height of the text in nodes is somewhat dependent on the node height

      // --- HELPER FUNCTIONS --- //
      function calcLabelWidth(label: string) {
        // function to calculate the width of a node's text box based on the number of chars
        return Math.max(87, 62 + 5 * label.length);
      }

      function hideChildren(d) {
        // function to temporarily hide/unhide child nodes on click
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update(d);
      }

      function colorNodeByFTE(d) {
        // set background color of node based on percent of a manager's subordinate's FTE completion
        if (!d.data.teamFtes) {
          return '#f23535';
        }
        const fteCompletion = d.data.teamFtes / d.data.teamCount;
        if (fteCompletion < .5) {
          return '#ffdc5e';
        } else if (fteCompletion < 1) {
          return '#58e454';
        } else {
          return 'green';
        }
      }

      // Assigns the x and y position for the nodes
      const treeData = treemap(root);

      // Compute the new tree layout.
      const nodes = treeData.descendants();
      const links = treeData.descendants().slice(1);

      // set fixed-distance between tree "levels"
      nodes.forEach( (d) => d.y = d.depth * treeLevelSeparation );

      // ****************** Nodes section ***************************

      // assign each node a sequential ID
      const node = svg.selectAll('g.node')
      .data(nodes, (d) => d.id || (d.id = i++));

      // --------- NODE ENTRY ANIMATIONS
      // Enter any new modes at the parent's previous position.
      const nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${source.x0},${source.y0})`)
      .on('click', hideChildren);

      // when a node enters the drawing, draw rectangle for each node
      nodeEnter.append('rect')
      .attr('class', 'node')
      .attr('width', (d) => d.width = calcLabelWidth(d.data.name))
      .attr('height', rectHeight)
      .attr('x', rectXpos)
      .attr('y', rectYpos)
      .attr('rx', rectBorderRadius)
      .attr('ry', rectBorderRadius)
      .style('stroke-width', 1)
      .style('stroke', 'black')
      .style('fill', (d) => colorNodeByFTE(d));

      // Add labels for the nodes
      nodeEnter.append('text')
      .attr('y', rectYpos)
      .attr('dy', `${textHeight}px`)
      .attr('text-anchor', 'start')
      .attr('fill', (d) => d.data.teamFtes ? 'black' : 'white')
      .text( (d) => `${d.data.name}` );

      // add FA icon to show whether node is collapsible/expandable
      nodeEnter.append('text')
      .attr('class', 'collapse-icon')
      .attr('style', 'font-family:FontAwesome')
      .attr('y', rectYpos)
      .attr('dy', `${textHeight}px`)
      .attr('x', (d) => calcLabelWidth(d.data.name) - 24)
      .text( (d) => {
        if (d._children) {
          return '\uf067';
        } else if (d.children) {
          return '\uf068';
        }
      });

      // --------- NODE UPDATE CONTENTS
      const nodeUpdate = nodeEnter.merge(node);

      // Transition to the proper position for the node
      nodeUpdate.transition()
      .duration(collapseAnimSpeed)
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

      // Update the node attributes and style
      nodeUpdate.select('rect.node')
      .attr('class', 'node')
      .attr('width', (d) => d.width = calcLabelWidth(d.data.name))
      .attr('height', rectHeight)
      .attr('x', rectXpos)
      .attr('y', rectYpos)
      .attr('rx', rectBorderRadius)
      .attr('ry', rectBorderRadius)
      .style('stroke-width', 1)
      .style('stroke', 'black')
      .style('fill', (d) => colorNodeByFTE(d));

      // on update, change the icon to match new collapsibility state
      nodeUpdate.select('text.collapse-icon')
      .text( (d) => {
        if (d._children) {
          return '\uf067';
        } else if (d.children) {
          return '\uf068';
        }
      });

      // Remove any exiting nodes
      const nodeExit = node.exit().transition()
      .duration(collapseAnimSpeed)
      .attr('transform', (d) => `translate(${source.x},${source.y})`)
      .remove();

      // on exit, shrink node rectangle size to 0
      nodeExit.select('rect')
      .attr('width', 1e-6)
      .attr('height', 1e-6);

      // on exit, reduce the opacity of text labels
      nodeExit.selectAll('text')
      .style('opacity', 1e-6);

      // ****************** links section ***************************

      // Update the links...
      const link = svg.selectAll('path.link')
        .data(links, (d) => d.id);

      // Enter any new links at the parent's previous position.
      const linkEnter = link.enter().insert('path', 'g')
        .attr('class', 'link')
        .attr('d', d3.linkVertical()
          .source( () => [source.x0, source.y0])
          .target( () => [source.x0, source.y0])
        );

      // UPDATE
      const linkUpdate = linkEnter.merge(link);

      // Transition back to the parent element position
      linkUpdate.transition()
        .duration(collapseAnimSpeed)
        .attr('d',
          d3.linkVertical()
          .source( (d) => [d.parent.x - 5 + (d.parent.width / 2), d.parent.y] )
          .target( (d) => [d.x - 5 + (d.width / 2), d.y])
        );

      // Remove any exiting links
      const linkExit = link.exit().transition()
        .duration(collapseAnimSpeed)
        .attr('d',
          d3.linkHorizontal()
          .source( () => [source.x, source.y])
          .target( () => [source.x, source.y])
        )
        .remove();

      // Store the old positions for transition.
      nodes.forEach( (d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }
  }
}
