import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@ngstarter-ui/components/button';
import {
  FormBuilderRendererExample
} from '../_examples/form-builder-renderer-example/form-builder-renderer-example';

@Component({
  imports: [
    Button,
    FormBuilderRendererExample,
    RouterLink
  ],
  templateUrl: './renderer.html',
  styleUrl: './renderer.scss'
})
export class Renderer {
}
