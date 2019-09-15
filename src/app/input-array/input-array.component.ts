import { Overlay, OverlayRef } from '@angular/cdk/overlay'
import { Component, OnInit, Input, ViewChild, TemplateRef, ViewContainerRef } from '@angular/core';
import { createRenderableField, resetIdentifiers, RenderableField } from '../mmm-configuration-specification';
import { TemplatePortal } from '@angular/cdk/portal';
import { Subscription, fromEvent } from 'rxjs';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-input-array',
  templateUrl: './input-array.component.html',
  styleUrls: ['./input-array.component.scss']
})
export class InputArrayComponent implements OnInit {
  @Input() field: RenderableField
  @ViewChild('contextMenu', { static: false }) contextMenu: TemplateRef<any>
  overlayRef: OverlayRef | null
  clickAway: Subscription
  
  constructor(
    public overlay: Overlay,
    public viewContainerRef: ViewContainerRef) { }

  ngOnInit() {
  }
  closeContextenu() {
    this.clickAway && this.clickAway.unsubscribe()
    if (this.overlayRef) {
      this.overlayRef.dispose()
      this.overlayRef = null
    }
  }

  openContextMenu({x, y}: MouseEvent, arrayElem: RenderableField) {
    this.closeContextenu()
    const positionStrategy = this.overlay.position()
    .flexibleConnectedTo({ x, y })
    .withPositions([
      {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top',
      }
    ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close()
    });

    this.overlayRef.attach(new TemplatePortal(this.contextMenu, this.viewContainerRef, {
      $implicit: arrayElem
    }));
    this.clickAway = fromEvent<MouseEvent>(document, 'click')
      .pipe(
        filter(event => {
          const clickTarget = event.target as HTMLElement
          return !!this.overlayRef && !this.overlayRef.overlayElement.contains(clickTarget)
        }),
        take(1),
      ).subscribe(() => this.closeContextenu())
  }

  addElement(afterArrayElem?: RenderableField) {
    const index = afterArrayElem ? Number(afterArrayElem.path[afterArrayElem.path.length - 1]) : -1
    const elementName = (index < 0 ? 0 : index + 1).toString()
    const element = createRenderableField([...this.field.path, elementName], elementName, this.field.specification[0])
    if (index < 0) {
      this.field.renderableFields.unshift(element)
    } else if (this.field.renderableFields.length <= (index + 1)) {
      this.field.renderableFields.push(element)
    } else {
      this.field.renderableFields.splice(index + 1, 0, element)
    }
    resetIdentifiers(this.field.renderableFields, this.field.path)
  }

  removeElement(arrayElem: RenderableField) {
    const index = Number(arrayElem.path[arrayElem.path.length - 1])
    if(index < this.field.renderableFields.length) {
      this.field.renderableFields = this.field.renderableFields.splice(index)
      resetIdentifiers(this.field.renderableFields, this.field.path)
    }
  }

}
