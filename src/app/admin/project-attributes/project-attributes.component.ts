import { Component, OnInit } from '@angular/core';
import { User } from './signup.interface';

@Component({
  selector: 'app-project-attributes',
  templateUrl: './project-attributes.component.html',
  styleUrls: ['./project-attributes.component.css']
})
export class ProjectAttributesComponent implements OnInit {

  // assign interface to public variable:
  // model binding must adhere to interface
  user: User = {
    name: 'tawanchai',
    account: {
      email: '',
      confirm: ''
    }
  };

  // fetch value and valid properties from #f
  onSubmit({ value, valid }: { value: User, valid: boolean }) {
    console.log(value, valid);
  }

  constructor() { }

  ngOnInit() {
  }

}
