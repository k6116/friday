import { Injectable } from '@angular/core';
import { ToolsService } from '../../../_shared/services/tools.service';

declare var $: any;
import * as _ from 'lodash';
import * as Highcharts from 'highcharts';


@Injectable()
export class ProjectFteRollupPrepDataService {

  bomData: any;
  chartData: any;
  firstLevelProject: any;

  constructor(
    private toolsService: ToolsService
  ) { }

  // take the raw bom data from the database and transform it into the proper format for the highcharts drillable treemap chart
  buildChartData(bomData: any): any {

    // set/reset chartData to an empty array
    this.chartData = [];

    // store the bom data locally in the service, since it will be referenced so often amongst the methods in here
    this.bomData = bomData;

    // take a deep copy of the first object in the bom data array
    const firstRecord = $.extend(true, {}, this.bomData[0]);

    // build the first level project (chart object)
    this.buildFirstLevelProject(firstRecord);

    console.log('chart data after building first level project');
    console.log(this.chartData);

    // starting with the first object, build the rest of the chart data structure with recursive method
    // to associate ids with parent ids to enable drilldown
    // NOTE: at this point parts will still be included in the structure, and ftes will not be rolled up
    this.buildProjectStructure(firstRecord, this.firstLevelProject);

    console.log('chart data after building project structure');
    console.log(this.chartData);

    // update the parent id's, such that the child project id's will reference their parent project id's, not part id's
    // (part levels will be phantom / ignored)
    // since this is also recursive, need to start with the first level (level zero) chart object
    this.updateParentIDs(this.chartData[0]);

    // filter chart objects to include only Projects
    this.removePartObjects();

    // remove duplicates if there are any at each individual level
    this.removeLevelDuplicates();

    // rollup the fte values for each project to a cumulative value for the treemap rectangle size and tooltip value
    // NOTE: this will only update a single property 'value'
    this.rollupFTEValues();

    // round the fte values to two decimal places
    this.roundFTEValues();

    // sort chart data by level, parent (for debug readability), and value (descending) for proper treemap rendering
    this.sortChartData();

    // remove projects with zero or null FTE values
    this.filterProjectsWithNoFTEs();

    console.log('chart data after removing projects with zero or null fte values');
    console.log(this.chartData);

    // update the level property since we removed levels (parts) and also want to start with level 1 instead of zero
    this.updateLevels();

    // set the color for the first level (selected project) to blue (first highcharts color)
    this.setFirstLevelColor();

    // return the chart data array
    return this.chartData;

  }


  buildFirstLevelProject(project: any) {

    // build and set the chart object
    this.firstLevelProject = {
      id: project.ParentID.toString(),
      name: project.ChildName,
      fte: project.TotalFTE ? project.TotalFTE : 0,
      value: project.TotalFTE ? project.TotalFTE : 0,
      entity: project.ChildEntity,
      type: project.ChildType,
      level: project.Level
    };

    // push the object into the chart data array
    this.chartData.push(this.firstLevelProject);

  }


  // build the chart data structure recursively to associate ids with parent ids and enable drilldown functionality
  // NOTE: project is a record from bomData (raw data from database), chartItem is an object for the chart data
  buildProjectStructure(project: any, chartItem: any) {

    // set the parent tree to compare with the child tree
    const parentTree = project.ParentTree;

    // iterate through each record in the bom data
    this.bomData.forEach(project1 => {

      // set the child tree by trimming off the last level/segment
      const childTree = project1.ParentTree.split(' > ').splice(0, project1.ParentTree.split(' > ').length - 1).join(' > ');

      // if the bom record's parent id matches the child id and the tree strings also match
      if ((project1.ParentID === project.ChildID && parentTree === childTree))  {

        // build a chart object to push into the chart data
        const chartObj = {
          id: chartItem.id + '_' + project1.ChildID,
          name: project1.ChildName,
          fte: project1.TotalFTE ? project1.TotalFTE : 0,
          value: project1.TotalFTE,
          parent: chartItem.id,
          type: project1.ChildType,
          entity: project1.ChildEntity,
          level: project1.Level
        };

        // push in the object
        this.chartData.push(chartObj);

        // recursively call this method passing the bom record and the chart object that was just pushed in
        // NOTE: need to pass the chart object because it keeps track of the id and parent id
        this.buildProjectStructure(project1, chartObj);

      }
    });

  }


  updateParentIDs(parentProject: any, parentID?: number) {

    // iterate through the chart data array
    this.chartData.forEach(childProject => {
      // look for matches where the parent id matches the child id
      if (childProject.parent === parentProject.id) {
        // store the parent id to cascade down to the child projects, skipping the parts
        if (parentProject.entity === 'Project') {
          parentID = parentProject.id;
        }
        // update the project's parent id
        if (childProject.entity === 'Project') {
          childProject.parent = parentID;
        }
        // update the parent id's for this project's children recursively
        this.updateParentIDs(childProject, parentID);
      }
    });

  }


  // filter chart objects to include only Projects
  removePartObjects() {

    this.chartData = this.chartData.filter(project => {
      return project.entity === 'Project';
    });

  }

  // remove duplicates if there are any at each individual level
  removeLevelDuplicates() {

    this.chartData = this.chartData.filter((data, index, self) =>
      index === self.findIndex((t) => (
        t.level === data.level && t.name === data.name && t.parent === data.parent && t.type === data.type
      ))
    );

  }

  // rollup the fte values for each project to a cumulative value for the treemap rectangle size and tooltip value
  // NOTE: this will only update a single property 'value'
  rollupFTEValues() {

    // iterate through each chart object
    this.chartData.forEach(project => {

      // get an exploded 'bom' just for this project
      const projectChartData = this.getProjectBOM(project, this.chartData);

      // filter the data such that there are no duplicate projects
      const filteredProjectChartData = projectChartData.filter((data, index, self) =>
        index === self.findIndex((t) => (
          t.name === data.name && t.type === data.type
        ))
      );

      // call the recusive function to rollup the fte values for this project
      rollupFTEValue(project, project, filteredProjectChartData);

    });


    function rollupFTEValue(projectToUpdate: any, projectToRecurse: any, filteredProjectChartData) {
      // iterate through the 'bom' of chart objects for the project to rollup the fte value for
      filteredProjectChartData.forEach(project => {
        // if the parent id matches the child id
        if (project.parent === projectToRecurse.id) {
          // update the value property
          projectToUpdate.value += project.value ? project.value : 0;
          // recurse
          rollupFTEValue(projectToUpdate, project, filteredProjectChartData);
        }
      });
    }

  }


  roundFTEValues() {

    // iterate through each chart object
    this.chartData.forEach(project => {

      // round the fte value to two decimal places if there is a value
      if (project.value) {
        project.value = this.toolsService.roundTo(project.value, 2);
      }

    });

  }

  // remove projects with zero or null FTE values
  filterProjectsWithNoFTEs() {

    this.chartData = this.chartData.filter(project => {
      return project.value;
    });

  }


  // used by rollupFTEValues to get a unique list of projects that are associated with (structured to) a given parent project
  getProjectBOM(project: any, data: any): any {

    // initialize an empty array that will be returned
    const projectBOM: any = [];

    // push the first project (the one passed as argument) into the array
    projectBOM.push(project);

    // call the recursive function to get all the child projects associated with this project
    recurseBOM(project, data);

    function recurseBOM(project2, data2) {
      data2.forEach(project3 => {
        if (project3.parent === project2.id) {
          projectBOM.push(project3);
          recurseBOM(project3, data2);
        }
      });
    }

    // return the array of objects
    return projectBOM;

  }


  // sort chart data by level, parent (for debug readability), and value (descending) for proper treemap rendering
  sortChartData() {

    // uses the lodash orderBy method
    this.chartData = _.orderBy(this.chartData, ['level', 'parent', 'value', ], ['asc', 'asc', 'desc']);

  }

  // update the level property since we removed levels (parts) and also want to start with level 1 instead of zero
  updateLevels() {

    // iterate through each chart object
    this.chartData.forEach(data => {
      // if it has a parent property (first level zero will not), determine its level using the number of segments in the parent string
      // e.g. 1_613 will be level 2 + 1
      if (data.hasOwnProperty('parent')) {
        const parentSegments = data.parent.split('_').length;
        data.level = parentSegments + 1;
      // otherwise if this is level zero just set to level 1
      } else {
        if (data.level === 0) {
          data.level = 1;
        }
      }
    });

  }


  setFirstLevelColor() {

    const levelZeroProjects = this.chartData.filter(project => {
      return project.level === 1;
    });

    levelZeroProjects.forEach((levelZeroProject, index) => {
      levelZeroProject.color = Highcharts.getOptions().colors[0];
    });


  }


  // get the highest fte value from the chart data, to use to calculate the bar multiplier
  getMaxFTE(chartData: any): number {

    let maxFTE = 0;
    chartData.forEach(data => {
      if (data.value > maxFTE) {
        maxFTE = data.value;
      }
    });

    return maxFTE;

  }


}
