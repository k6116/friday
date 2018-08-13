import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'projectTypePipe',
  pure: false
})

export class ProjectTypePipe implements PipeTransform {
// Pipe to display only projectTypes that have .checkboxState === true

  transform(projectList: any, projectTypesList: any) {
    // filter projectTypesList to only the cheked ones
    const filteredProjectTypes = projectTypesList.filter(item => item.checkboxState === true);
    // filter projectList to only the projectTypes that are also in the filtered projectTypesList
    return projectList.filter(project => filteredProjectTypes.some(e => e.id === project.ProjectTypeID) === true );
  }

}
