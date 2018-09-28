import { Component, OnInit, OnChanges, Input } from '@angular/core';

import * as d3 from 'd3';

@Component({
  selector: 'app-bom-draw-d3',
  templateUrl: './bom-draw-d3.component.html',
  styleUrls: ['./bom-draw-d3.component.css', '../../_shared/styles/common.css']
})
export class BomDrawD3Component implements OnInit, OnChanges {

  @Input() bomJson: any;

  partDeptLegend: any;  // for storing d3 legend data

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {

    console.log('it changed');
    // when bomJson input binding changes value, parse data for the legend and draw the chart
    if (this.bomJson) {

      if (this.bomJson.constructor === Object) {
        // this is the expected data type, so we're good
      } else if (this.bomJson.constructor === Array && this.bomJson.length === 1) {
        // d3 drawing expects a single object, not an array of objects, so let
        this.bomJson = this.bomJson[0];
      } else {
        console.log('ERROR: d3 BOM drawing received an unexpected data type');
        return;
      }

      // parse out legend data from nested JSON
      this.partDeptLegend = this.calcDepartmentLegend(this.bomJson);

      // kill any existing plots within the container and draw
      d3.select('#d3-container').selectAll('*').remove();
      this.drawD3Plot(this.bomJson);
    }

  }

  calcDepartmentLegend(bom: any) {
    // recursively traverse nested JSON BOM to get count of part departments for legend

    const legend = {};

    // helper function for summing child legend values
    const sumChildLegend = (acc, currentValue) => {
      for (const prop in currentValue) {
        if (currentValue.hasOwnProperty(prop)) {
          acc[prop] = (acc[prop] || 0) + currentValue[prop];
        }
      }
      return acc;
    };

    if (Array.isArray(bom)) {
      // if current level is an array, loop through each element and recursively collect the legend values for its children
      bom.forEach( el => {
        // add entity ('part' or 'project') to legend (or initialize it to 0 + 1 if it doesn't exist)
        legend[el.entity] = (legend[el.entity] || 0) + 1;
        if (el.entity === 'Part') {
          // if it's a part, also add its department to the legend
          legend[el.dept] = (legend[el.dept] || 0) + 1;
        }

        // if element has children, recursively compute the child's legend, and sum it with current level
        if (el.hasOwnProperty('children')) {
          const nextLv = this.calcDepartmentLegend(el.children);
          const sum = [legend, nextLv];
          return sum.reduce(sumChildLegend);
        }
      });

    } else {
      // if current level is a single level, just add its values
      legend[bom.entity] = (legend[bom.entity] || 0) + 1;
      if (bom.entity === 'Part') {
        legend[bom.dept] = (legend[bom.dept] || 0) + 1;
      }

      // if element has children, recursively compute the child's legend, and sum it with current level
      if (bom.hasOwnProperty('children')) {
        const nextLv = this.calcDepartmentLegend(bom.children);
        const sum = [legend, nextLv];
        return sum.reduce(sumChildLegend);
      }
    }

    return legend;
  }

  drawD3Plot(bomJson: any) {

    // set start position/scale of drawing, and size of nodes (to set default node spacing)
    const initialTransform = d3.zoomIdentity.translate(400, 300).scale(1);
    const nodeSize = {height: 28, width: 20};
    const zoomSpeed = 1700; // some number between 400 and 2000
    const deptColors: any = {
      HFTC: '#c2b1ff',
      PMTC: '#67c44b',
      PICO: '#fc8c60',
      ThinFilm: '#ffaae6',
      EXT: '#24CBE5',
      NPSS: '#ffe881'
    };

    // set custom zoom settings
    const zoom = d3.zoom()
      .scaleExtent([0.2, 4])  // restrict zoom to this scale range
      .wheelDelta(() => { // custom wheel delta function to reduce zoom speed
        return -d3.event.deltaY * (d3.event.deltaMode ? 120 : 1) / zoomSpeed;
      })
      .on('zoom', () => {
        // when zoomed, actually perform the transform on the 'svg' object using d3.event.transform
        svg.attr('transform', d3.event.transform);
      });

    const height = 600;
    const width = 1500;
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

    // create tooltip overlay object
    const tooltip = d3.select('#d3-container').append('div')
      .attr('class', 'part-details')
      .style('opacity', 0);

    // setup legend container
    const legend = d3.select('#d3-container').append('div')
      .attr('class', 'd3-legend')
      .append('svg')
      .attr('width', 120)
      .attr('height', 200);

    // setup legend header text
    const legendHeader = legend.append('text')
      .attr('x', 3)
      .attr('y', 13)
      .style('font-size', '14px')
      .text('Legend:');

    // build text array for legend
    const legendValues = [
      ['Project', '#FFF'],
      ['Part', '#FFF']
    ];
    Object.keys(deptColors).map( (key) => {
      legendValues.push([key, deptColors[key]]);
    });

    // draw legend
    const deptLegend = legend.selectAll('.container')
      .data(legendValues)
      .enter()
      .append('g');
    deptLegend.append('rect')
      .attr('width', 90)
      .attr('height', 20)
      .attr('x', 3)
      .attr('y', (d, index) => index * 21 + 20)
      .attr('rx', 4)
      .attr('ry', 4)
      .style('stroke', '#000')
      .style('stroke-width', (d) => d[0] === 'Project' ? 2 : 0)
      .style('fill', (d) => d[1] );
    deptLegend.append('text')
      .attr('dy', '.35em')
      .attr('y', (d, index) => index * 21 + 29)
      .attr('x', 6)
      .text( (d) => {
        const total = this.partDeptLegend[d[0]] ? this.partDeptLegend[d[0]] : 0;
        return `${total} | ${d[0]}`;
      });


    let i = 0;
    const duration = 750;

    // declares a tree layout and assigns the size
    // const treemap = d3.tree().size([height, width]);
    const treemap = d3.tree().nodeSize([nodeSize.height, nodeSize.width]);

    // Assigns data for root node, and the starting location of the root node
    const root = d3.hierarchy(bomJson);
    root.x0 = 0;
    root.y0 = 0;

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

      // Assigns the x and y position for the nodes
      const treeData = treemap(root);

      // Compute the new tree layout.
      const nodes = treeData.descendants();
      const links = treeData.descendants().slice(1);

      // set fixed-distance between tree "levels"
      nodes.forEach( (d) => d.y = d.depth * 280 );

      // ****************** Nodes section ***************************

      // Update the nodes...
      const node = svg.selectAll('g.node')
        .data(nodes, function(d) {return d.id || (d.id = ++i); });

      // --------- NODE ENTRY ANIMATIONS
      // Enter any new modes at the parent's previous position.
      const nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr('transform', (d) => `translate(${source.y0},${source.x0})`)
        .on('click', click);

      // draw rectangle for each node
      nodeEnter.append('rect')
        .attr('class', 'node')
        .attr('width', (d) => Math.max(85, 60 + 5 * d.data.name.length))
        .attr('height', 20)
        .attr('x', -8)
        .attr('y', -11)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('cursor', 'pointer')
        .style('stroke-width', (d) => d.data.entity === 'Project' ? 2 : 0)
        .style('stroke', '#000')
        .style('fill', (d) => {
          if (d._children) {
            // special case for collapsed
            return 'lightsteelblue';
          } else if (d.data.entity === 'Project') {
            return '#fff';
          } else {
            return deptColors[d.data.dept] ? deptColors[d.data.dept] : '#FFF';
          }
        });

      // Add labels for the nodes
      nodeEnter.append('text')
        .attr('dy', '.35em')
        .attr('cursor', 'pointer')
        .attr('text-anchor', 'start')
        .text( (d) => `${d.data.qty}  |  ${d.data.name}` )
        .on('mouseover', (d) => {
          tooltip.transition()
          .duration(100)
          .style('opacity', 1);
          tooltip.html(`<strong>${d.data.longName}</strong><br /><br />
            Dept: ${d.data.dept}<br />
            Type: ${d.data.type}<br />
            Qty: ${d.data.qty}<br />`)
            .style('top', `${d3.event.pageY + 15}px`).style('left', `${d3.event.pageX + 10}px`);
        })
        .on('mouseout', (d) => {
          tooltip.transition()
            .duration(100)
            .style('opacity', 0);
        });

      // --------- NODE UPDATE CONTENTS
      const nodeUpdate = nodeEnter.merge(node);

      // Transition to the proper position for the node
      nodeUpdate.transition()
        .duration(duration)
        .attr('transform', (d) => `translate(${d.y},${d.x})`);

      // Update the node attributes and style
      nodeUpdate.select('rect.node')
        .attr('class', 'node')
        .attr('width', (d) => {
          d.width = Math.max(85, 60 + 5 * d.data.name.length);
          return d.width;
        })
        .attr('height', 20)
        .attr('x', -8)
        .attr('y', -11)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('cursor', 'pointer')
        .style('stroke-width', (d) => d.data.entity === 'Project' ? 2 : 0)
        .style('stroke', '#000')
        .style('fill', (d) => {
          if (d._children) {
            // special case for collapsed
            return 'lightsteelblue';
          } else if (d.data.entity === 'Project') {
            return '#fff';
          } else {
            return deptColors[d.data.dept] ? deptColors[d.data.dept] : '#FFF';
          }
        });

      // Remove any exiting nodes
      const nodeExit = node.exit().transition()
        .duration(duration)
        .attr('transform', (d) => `translate(${source.y},${source.x})`)
        .remove();

      // On exit reduce the node circles size to 0
      nodeExit.select('rect')
      .attr('width', 1e-6)
      .attr('height', 1e-6);

      // On exit reduce the opacity of text labels
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
        .duration(duration)
        .attr('d',
          d3.linkHorizontal()
          .source( (d) => [d.parent.y + d.parent.width - 10, d.parent.x] )
          .target( (d) => [d.y, d.x])
        );

      // Remove any exiting links
      const linkExit = link.exit().transition()
        .duration(duration)
        .attr('d',
          d3.linkHorizontal()
          .source( () => [source.y, source.x])
          .target( () => [source.y, source.x])
        )
        .remove();

      // Store the old positions for transition.
      nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });

      // Toggle children on click
      function click(d) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update(d);
      }
    }
  }
}
