import { Component, OnInit } from '@angular/core';
import { ApiDataService } from '../_shared/services/api-data.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

  showProjectsModal: boolean;
  projects: any;
  selectedProjectId: number;

  constructor(private apiDataService: ApiDataService) { }

  ngOnInit() {

  }

  onModalDemoClick() {

    console.log('modal demo clicked');
   // this.setMockData();
    this.apiDataService.getProjects()
    .subscribe(
      res => {
        console.log('get project data successfull:');
        console.log(res);
        this.projects = res;
      },
      err => {
        console.log('get project data error:');
        console.log(err);
      }
    );

     this.showProjectsModal = true;
  }

  onModalClosed(selectedProject: number) {
    setTimeout(() => {
      this.showProjectsModal = false;
    }, 500);
    this.selectedProjectId = selectedProject;
    console.log('Selected Project Id:');
    console.log(this.selectedProjectId);
  }

  setMockData() {

    this.projects = [
      {
        projectName: 'G-Max Jr.',
        projectType: 'NPI',
        projectDesc: '13-30 GHz Scope3.5mm interface',
        createdBy: 'Paul Sung',
        creationOn: '01/01/2018',
        lastUpdatedBy: 'Paul Sung',
        lastUpdateDate: '01/15/2018'
      },
      {
        projectName: 'G-Max Nuke',
              projectType: 'NPI',
              projectDesc: 'Calibration Module for Gmax (AMC)',
              createdBy: 'Paul Sung',
              creationOn: '01/01/2018',
              lastUpdatedBy: 'Paul Sung',
              lastUpdateDate: '01/15/2018'
      },
      {
        projectName: 'G-MAX OMA Step 1: 70GHz',
            projectType: 'NCI',
            projectDesc: 'Next generation OMA up to 110G',
            createdBy: 'Paul Sung',
            creationOn: '01/01/2018',
            lastUpdatedBy: 'Paul Sung',
            lastUpdateDate: '01/15/2018'
      },
      {
        projectName: 'G-Max Panama',
        projectType: 'NCI',
        projectDesc: 'G-Max AP2/AP3 adapter',
        createdBy: 'Paul Sung',
        creationOn: '01/01/2018',
        lastUpdatedBy: 'Paul Sung',
        lastUpdateDate: '01/15/2018'
      },
      {
        projectName: 'G-Max Sedona',
        projectType: 'NCI',
        projectDesc: 'G-Max 60GHz SE v-term adapter',
        createdBy: 'Paul Sung',
        creationOn: '01/01/2018',
        lastUpdatedBy: 'Paul Sung',
        lastUpdateDate: '01/15/2018'
      },
      {
        projectName: 'MXG/EXG and MXA/EXA +++',
            projectType: 'NCI',
            projectDesc: '',
            createdBy: 'Paul Sung',
            creationOn: '01/01/2018',
            lastUpdatedBy: 'Paul Sung',
            lastUpdateDate: '01/15/2018'
      },
      {
        projectName: 'G-Max Program',
        projectType: 'NCI',
        projectDesc: '',
        createdBy: 'Paul Sung',
        creationOn: '01/01/2018',
        lastUpdatedBy: 'Paul Sung',
        lastUpdateDate: '01/15/2018'
      }
    ];
  }

}
