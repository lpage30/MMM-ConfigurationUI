import { Component, OnInit, Input } from '@angular/core';
import { RenderableField } from '../mmm-configuration-specification';

@Component({
  selector: 'app-input-field',
  templateUrl: './input-field.component.html',
  styleUrls: ['./input-field.component.scss']
})
export class InputFieldComponent implements OnInit {
  @Input() field: RenderableField
  constructor() { }

  ngOnInit() {
  }

}
