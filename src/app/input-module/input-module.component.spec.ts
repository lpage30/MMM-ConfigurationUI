import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { InputModuleComponent } from './input-module.component';

describe('ModuleComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        InputModuleComponent
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(InputModuleComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'MMM-ConfigurationUI'`, () => {
    const fixture = TestBed.createComponent(InputModuleComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('MMM-ConfigurationUI');
  });

  it('should render title in a h1 tag', () => {
    const fixture = TestBed.createComponent(InputModuleComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Welcome to MMM-ConfigurationUI!');
  });
});
