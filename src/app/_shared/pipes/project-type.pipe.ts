import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'projectTypePipe',
  pure: false
})

export class ProjectTypePipe implements PipeTransform {

  transform(projectList: any, projectTypesList: any) {
    const filter = projectTypesList.filter(item => item.checkboxState === true);
    return projectList.filter(project => filter.some(e => e.id === project.ProjectTypeID) === true );
  }

}
