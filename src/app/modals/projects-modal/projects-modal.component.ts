import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes, group } from '@angular/animations';


@Component({
  selector: 'app-projects-modal',
  templateUrl: './projects-modal.component.html',
  styleUrls: ['./projects-modal.component.css'],
  animations: [
    trigger('modalStateOuter', [
      state('in', style({
        'background-color': 'rgba(0, 0, 0, 0.2)'
      })),
      transition('in => out', [
        animate(500, style({
          'background-color': 'rgba(255, 255, 255, 0)'
        }))
      ]),
      transition('out => in', [
        animate(500, style({
          'background-color': 'rgba(0, 0, 0, 0.2)'
        }))
      ])
    ]),
    trigger('modalStateInner', [
      state('in', style({
        opacity: 1
      })),
      transition('in => out', [
        animate(500, style({
          opacity: 0
        }))
      ]),
      transition('out => in', [
        animate(500, style({
          opacity: 1
        }))
      ])
    ])
  ]
})
export class ProjectsModalComponent implements OnInit {

  outerDivState: string;
  innerDivState: string;
  filterString: string;
  checkboxValue: any;

  @Input() projects: any;
  @Output() selectedProject = new EventEmitter<any>();

constructor() {

}

  ngOnInit() {

    this.outerDivState = 'out';
    this.innerDivState = 'out';
    setTimeout(() => {
      this.outerDivState = 'in';
    }, 0);
    setTimeout(() => {
      this.innerDivState = 'in';
    }, 0);

    console.log('projects received in projects modal');
    console.log(this.projects);
  }

  onSelectedProject(selProject: any) {

      console.log('Selected Project Id:');
      console.log(selProject.ProjectID);

      console.log('Selected Project:');
      console.log(selProject.ProjectName);

      this.outerDivState = 'out';
      this.innerDivState = 'out';
      this.selectedProject.emit(selProject);
      this.outerDivState = 'out';
      this.innerDivState = 'out';

  }

    onCancelClicked() {
      console.log('cancel button clicked');
      this.outerDivState = 'out';
      this.innerDivState = 'out';
    }

}

