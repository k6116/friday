import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { ApiDataBomService } from '../../_shared/services/api-data/_index';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import * as d3 from 'd3';

@Component({
  selector: 'app-bom-draw-d3',
  templateUrl: './bom-draw-d3.component.html',
  styleUrls: ['./bom-draw-d3.component.css', '../../_shared/styles/common.css']
})
export class BomDrawD3Component implements OnInit, OnChanges {

  @Input() selectedBom: any;

  bill: any;  // for storing the selected bill as flat array
  billHierarchy: any; // for storing the selected bill as nested JSON
  partDepartmentSummary: any = {};  // for storing d3 legend data

  constructor(private apiDataBomService: ApiDataBomService) { }

  ngOnInit() {
  }

  ngOnChanges() {

    // when selectedBom input binding changes value, fetch the new BOM and draw the chart
    if (this.selectedBom) {
      // parse selected BOM info from bom-selector child component
      const selectedName = this.selectedBom.PartOrProjectName;
      const selectedEntity = this.selectedBom.EntityType;
      const selectedID = selectedEntity === 'Project' ? this.selectedBom.ParentProjectID : this.selectedBom.ParentPartID;

      // get the selected BOM as flat array
      const bomSubscription = this.apiDataBomService.showSingleBom(selectedID, selectedEntity).subscribe( res => {

        this.bill = res;
        bomSubscription.unsubscribe();

        // initialize part department sums
        this.partDepartmentSummary = {Project: 0, Part: 0};
        this.sumPartDepartments(this.bill);

        // initialize bomtree
        this.billHierarchy = {
          name: this.bill[0].ParentName.length > 19 ? `${this.bill[0].ParentName.slice(0, 20)}...` : this.bill[0].ParentName,
          longName: this.bill[0].ParentName,
          id: this.bill[0].ParentID,
          qty: 1,
          dept: this.bill[0].ParentDepartment,
          type: this.bill[0].ParentType,
          entity: this.bill[0].ParentEntity
        };

        // using async/await to wait for BOM parser to finish
        const bomSetup = async () => {
          // recursively parse the BOM structure
          const jsonBom = await this.bomTraverse(0, 1);

          // add the recursive output as 'children' property of the tree nodeStructure
          this.billHierarchy.children = jsonBom.nextLvData;

          // kill any existing plots within the container, and then draw
          d3.select('#d3-container').selectAll('*').remove();
          this.drawD3Plot();
        };

        // execute our async function
        bomSetup();
      });
    }

  }

  bomTraverse(i: number, lv: number) {
    // i = index of the array to start traversing (usu 0)
    // lv - initial level of the BOM (usu 1)
    const children = [];
    while (i < this.bill.length) {
      if (this.bill[i].Level === lv) {
        // traverse down and collect all the siblings in this level
        let newNode: any;
        newNode = {
          name: this.bill[i].ChildName.length > 19 ? `${this.bill[i].ChildName.slice(0, 20)}...` : this.bill[i].ChildName,
          longName: this.bill[i].ChildName,
          qty: this.bill[i].QtyPer,
          id: this.bill[i].ChildID,
          dept: this.bill[i].ChildDepartment,
          type: this.bill[i].ChildType,
          entity: this.bill[i].ChildEntity
        };
        children.push(newNode);
        i++;
      } else if (this.bill[i].Level > lv) {
        // if the next record is a child, recurse
        // when we return to this level, continue traversing from the farthest-reached index
        const output = this.bomTraverse(i, lv + 1);
        const lastIndex = children.length - 1;
        children[lastIndex].children = output.nextLvData;
        i = Number(output.nextRow);
      } else if (this.bill[i].Level < lv) {
        // if the next record is a parent, return the complete set of nested children
        // and the next value to continue traversing at
        return {
          nextRow: i,
          nextLvData: children
        };
      }
    } // end while
    return {
      nextRow: i,
      nextLvData: children
    };
  } // end bomTraverse

  sumPartDepartments(bill: any) {
    // loop through the flat bill of materials, and sum up the departments of each of the parts
    bill.forEach( item => {
      if (item.ChildEntity === 'Part') {

        // increment number of parts
        this.partDepartmentSummary.Part = this.partDepartmentSummary.Part + 1;

        const deptName = item.ChildDepartment;
        if (this.partDepartmentSummary.hasOwnProperty(deptName)) {
          // if the department exists in our object, increment its value
          this.partDepartmentSummary[deptName] = this.partDepartmentSummary[deptName] + 1;
        } else {
          this.partDepartmentSummary[deptName] = 1;
        }
      } else {
        // must be a project
        this.partDepartmentSummary.Project = this.partDepartmentSummary.Project + 1;
      }
    });
  }

  drawD3Plot() {

    // set start position/scale of drawing, and size of nodes (to set default node spacing)
    const initialTransform = d3.zoomIdentity.translate(400, 400).scale(1);
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

    // append the svg object to the body of the page and appends a 'group' container element to 'svg'
    const svg = d3.select('#d3-container').append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .append('g');

    // define a zoom function for the SVG, and an initial transform for the zoom
    // if you don't set the initial transform using the defined zoom function, it will 'snap' back to the origin on first move
    d3.select('svg')
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
        const total = this.partDepartmentSummary[d[0]] ? this.partDepartmentSummary[d[0]] : 0;
        return `${total} | ${d[0]}`;
      });


    let i = 0;
    const duration = 750;

    // declares a tree layout and assigns the size
    // const treemap = d3.tree().size([height, width]);
    const treemap = d3.tree().nodeSize([nodeSize.height, nodeSize.width]);

    // Assigns data for root node, and the starting location of the root node
    const root = d3.hierarchy(this.billHierarchy);
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
