import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../_shared/services/auth.service';
import { HighchartsExtensionsService } from '../_shared/services/highcharts-extensions.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css', '../_shared/styles/common.css'],
  providers: [HighchartsExtensionsService]
})
export class MainComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private highchartsExtensionsService: HighchartsExtensionsService
  ) { }

  ngOnInit() {

    // console.log(`main component has been initialized`);

    // console.log('testing user resolver within main component (this.route.snapshot.data)');
    // console.log(this.route.snapshot.data);
    // console.log('setting logged in user in auth service; assumption is that main will always init before child components');
    this.authService.loggedInUser = this.route.snapshot.data.loggedInUser.jarvisUser;
    this.authService.setLoggedIn(true);

  }

}
