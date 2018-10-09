import { Component, OnInit } from '@angular/core';
import { ApiDataProjectService } from '../../_shared/services/api-data/_index';
import { CacheService } from '../../_shared/services/cache.service';
import { AuthService } from '../../_shared/services/auth.service';

@Component({
  selector: 'app-transfer-projects',
  templateUrl: './transfer-projects.component.html',
  styleUrls: ['./transfer-projects.component.css', '../../_shared/styles/common.css']
})
export class TransferProjectsComponent implements OnInit {

  teamProjectList: any;

  constructor(
    private apiDataProjectService: ApiDataProjectService,
    private cacheService: CacheService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.getTeamProjects(this.authService.loggedInUser.managerEmailAddress);
  }

  getTeamProjects(managerEmailAddress: string) {
    this.apiDataProjectService.getTeamProjectList(managerEmailAddress)
    .subscribe(
      res => {
        this.teamProjectList = res;
        console.log('this.teamProjectList', this.teamProjectList)
      },
      err => {
        console.log('get project data error:');
        console.log(err);
      }
    );
  }

  onCheckboxClick(project: any) {
    console.log('project', project)
  }

}
