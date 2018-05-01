import { Component, OnInit } from '@angular/core';
import { ApiDataService } from '../_shared/services/api-data.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

constructor ( private apiDataService: ApiDataService) {

}

  ngOnInit() {

  }

  onTestClick() {

  }
}
