import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiDataBomService } from '../../_shared/services/api-data/_index';
import { Subscription } from 'rxjs/Subscription';
import { ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

declare var $: any;

@Component({
  selector: 'app-bom-map',
  templateUrl: './bom-map.component.html',
  styleUrls: ['./bom-map.component.css', '../../_shared/styles/common.css']
})
export class BomMapComponent implements OnInit {

  @ViewChild('treeComponent') treeComponent;

  billList: any;  // for getting the list of bills in drop-down
  billListSub: Subscription;
  bill: any;  // for storing the selected bill as flat array

  billHierarchy: any;


  constructor(private apiDataBomService: ApiDataBomService) { }

  ngOnInit() {
    // get list of bills in drop-down
    this.billListSub = this.apiDataBomService.index().subscribe( res => {
      this.billList = res;
    });

  }

  onBomSelect(selected: number) {

    // get the selected BOM as flat array
    const bomSubscription = this.apiDataBomService.showSingleBom(selected).subscribe( res => {


      this.bill = res;
      bomSubscription.unsubscribe();

      // initialize bomtree
      this.billHierarchy = {
        name: this.bill[0].ParentName,
        id: this.bill[0].ParentID
      };

      // recursively parse the BOM structure
      const jsonBom = this.bomTraverse(0, 1);

      // add the recursive output as 'children' property of the tree nodeStructure
      this.billHierarchy.children = jsonBom.nextLvData;

      console.log('finalized bom structure');
      console.log(this.billHierarchy);
      window.setTimeout( () => {this.drawD3Plot(); }, 2000);
    });


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
          name: this.bill[i].ChildName,
          qty: this.bill[i].QtyPer,
          id: this.bill[i].ChildID
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



  drawD3Plot() {
    // start d3

    // Set the dimensions and margins of the diagram
    const margin = {top: 65 + 50, right: 30, bottom: 0, left: 180};
    const width = $(window).width() - margin.left - margin.right;
    const height = $(window).height() - margin.top - margin.bottom;

    // append the svg object to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    const svg = d3.select('#d3-container').append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .call(d3.zoom().on('zoom', function () {
      svg.attr('transform', d3.event.transform);
    }))
    .append('g')
    .attr('transform', 'translate('
          + margin.left + ',' + margin.top + ')');

    let i = 0;
    const duration = 750;
    let root;

    // declares a tree layout and assigns the size
    const treemap = d3.tree().size([height, width]);

    // Assigns parent, children, height, depth
    root = d3.hierarchy(this.billHierarchy, function(d) { return d.children; });
    root.x0 = height / 2;
    root.y0 = 0;

    // Collapse after the second level
    root.children.forEach(collapse);

    update(root);

    // Collapse the node and all it's children
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

      // Normalize for fixed-depth.
      nodes.forEach(function(d) { d.y = d.depth * 180; });

      // ****************** Nodes section ***************************

      // Update the nodes...
      const node = svg.selectAll('g.node')
        .data(nodes, function(d) {return d.id || (d.id = ++i); });

      // Enter any new modes at the parent's previous position.
      const nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr('transform', function(d) {
          return 'translate(' + source.y0 + ',' + source.x0 + ')';
      })
      .on('click', click);

      // Add Circle for the nodes
      nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('r', 1e-6)
        .style('fill', function(d) {
            return d._children ? 'lightsteelblue' : '#fff';
        });

      // Add labels for the nodes
      nodeEnter.append('text')
        .attr('dy', '.35em')
        .attr('x', function(d) {
            return d.children || d._children ? -13 : 13;
        })
        .attr('text-anchor', function(d) {
            return d.children || d._children ? 'end' : 'start';
        })
        .text(function(d) { return d.data.name; });

      // UPDATE
      const nodeUpdate = nodeEnter.merge(node);

      // Transition to the proper position for the node
      nodeUpdate.transition()
      .duration(duration)
      .attr('transform', function(d) {
          return 'translate(' + d.y + ',' + d.x + ')';
      });

      // Update the node attributes and style
      nodeUpdate.select('circle.node')
      .attr('r', 10)
      .style('fill', function(d) {
          return d._children ? 'lightsteelblue' : '#fff';
      })
      .attr('cursor', 'pointer');


      // Remove any exiting nodes
      const nodeExit = node.exit().transition()
        .duration(duration)
        .attr('transform', function(d) {
            return 'translate(' + source.y + ',' + source.x + ')';
        })
        .remove();

      // On exit reduce the node circles size to 0
      nodeExit.select('circle')
      .attr('r', 1e-6);

      // On exit reduce the opacity of text labels
      nodeExit.select('text')
      .style('fill-opacity', 1e-6);

      // ****************** links section ***************************

      // Update the links...
      const link = svg.selectAll('path.link')
        .data(links, function(d) { return d.id; });

      // Enter any new links at the parent's previous position.
      const linkEnter = link.enter().insert('path', 'g')
        .attr('class', 'link')
        .attr('d', function(d) {
          const o = {x: source.x0, y: source.y0};
          return diagonal(o, o);
        });

      // UPDATE
      const linkUpdate = linkEnter.merge(link);

      // Transition back to the parent element position
      linkUpdate.transition()
        .duration(duration)
        .attr('d', function(d) { return diagonal(d, d.parent); });

      // Remove any exiting links
      const linkExit = link.exit().transition()
        .duration(duration)
        .attr('d', function(d) {
          const o = {x: source.x, y: source.y};
          return diagonal(o, o);
        })
        .remove();

      // Store the old positions for transition.
      nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });

      // Creates a curved (diagonal) path from parent to the child nodes
      function diagonal(s, d) {

      const path = `M ${s.y} ${s.x}
              C ${(s.y + d.y) / 2} ${s.x},
                ${(s.y + d.y) / 2} ${d.x},
                ${d.y} ${d.x}`;

      return path;
      }

      // Toggle children on click.
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
