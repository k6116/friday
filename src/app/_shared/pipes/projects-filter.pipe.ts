import { Pipe, PipeTransform } from '@angular/core';

// This pipe is created for the project-modal to filter projects using checkboxes
@Pipe({
    name: 'projectsFilter',
    pure: false
})
export class ProjectsFilterPipe implements PipeTransform {
  // projectList is an object listing all projects;
  // filterItems is the checkbox object with id:string, title: string, value: string and checked: boolean
  transform(projectList: any, filterItems: any) {
    // filter for checkboxes that are checked
    const filterChecked = filterItems.filter(item => item.checked);

    // if at least one checkbox is checked:
    if (filterChecked.length !== 0) {
      // loop through all checked checkboxes and apply their condition
      for (let i = 0; i < filterChecked.length; i++) {
        if (filterChecked[i].id === 'myTeamCheck') {
          projectList = projectList.filter(project =>
            project.ProjectOrgManager === filterChecked[i].value || project.EmailAddress === filterChecked[i].value);
        }
        if (filterChecked[i].id === 'npiCheck') {
          projectList = projectList.filter(project => project.ProjectTypeName === filterChecked[i].value);
        }
      }
      // output the filtered projectList
      return projectList;

    // if no checkbox is checked, return the original projectList
    } else {
      return projectList;
    }
  }
}
