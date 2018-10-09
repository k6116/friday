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

    // set start position/scale of drawing, and size of nodes (to set default node spacing)
    const initialTransform = d3.zoomIdentity.translate(400, 300).scale(1);
    const nodeSize = {height: 28, width: 20};
    const aspect = (window.innerWidth - 180) / (window.innerHeight - 70); // calculate aspect ratio, including side and top nav
    const height = 0.75 * window.innerHeight;
    const width = height * aspect;
    const zoomSpeed = 1700; // some number between 400 and 2000

    // set custom zoom settings
    const zoom = d3.zoom()
      // .scaleExtent([0.2, 4])  // restrict zoom to this scale range
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
    const treemap = d3.tree().nodeSize([nodeSize.height, nodeSize.width]);

    // Assigns data for root node, and the starting location of the root node
    const root = d3.hierarchy(bomJson);
    root.x0 = 0;
    root.y0 = 0;

    // set index counter for node ID assignment
    let i = 1;
    update(root);

    // describes how to collapse a node and all its children
    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    function update(source) {

      // --- SETTINGS --- //
      const treeLevelSeparation = 480;  // horizontal spacing between tiers/levels of the BOM tree
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

      function colorNodeByType(d) {
        return d._children ? 'silver' : '#fff';
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
        .attr('transform', (d) => `translate(${source.y0},${source.x0})`)
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
        .style('fill', (d) => colorNodeByType(d));

      // Add labels for the nodes
      nodeEnter.append('text')
        .attr('y', rectYpos)
        .attr('dy', `${textHeight}px`)
        .attr('text-anchor', 'start')
        .text( (d) => `${d.data.name}` );

      // --------- NODE UPDATE CONTENTS
      const nodeUpdate = nodeEnter.merge(node);

      // Transition to the proper position for the node
      nodeUpdate.transition()
        .duration(collapseAnimSpeed)
        .attr('transform', (d) => `translate(${d.y},${d.x})`);

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
        .style('fill', (d) => colorNodeByType(d));

      // Remove any exiting nodes
      const nodeExit = node.exit().transition()
        .duration(collapseAnimSpeed)
        .attr('transform', (d) => `translate(${source.y},${source.x})`)
        .remove();

      // on exit, shrink node rectangle size to 0
      nodeExit.select('rect')
      .attr('width', 1e-6)
      .attr('height', 1e-6);

      // on exit, reduce the opacity of text labels
      nodeExit.select('text')
      .style('fill-opacity', 1e-6);

      // ****************** links section ***************************

      // Update the links...
      const link = svg.selectAll('path.link')
        .data(links, (d) => d.id);

      // Enter any new links at the parent's previous position.
      const linkEnter = link.enter().insert('path', 'g')
        .attr('class', 'link')
        .attr('d', d3.linkHorizontal()
          .source( () => [source.y0, source.x0])
          .target( () => [source.y0, source.x0])
        );

      // UPDATE
      const linkUpdate = linkEnter.merge(link);

      // Transition back to the parent element position
      linkUpdate.transition()
        .duration(collapseAnimSpeed)
        .attr('d',
          d3.linkHorizontal()
          .source( (d) => [d.parent.y + d.parent.width - 10, d.parent.x] )
          .target( (d) => [d.y, d.x])
        );

      // Remove any exiting links
      const linkExit = link.exit().transition()
        .duration(collapseAnimSpeed)
        .attr('d',
          d3.linkHorizontal()
          .source( () => [source.y, source.x])
          .target( () => [source.y, source.x])
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
