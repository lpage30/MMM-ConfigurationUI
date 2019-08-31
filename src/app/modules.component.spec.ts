import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ModulesComponent } from './modules.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        ModulesComponent
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(ModulesComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'MMM-ConfigurationUI'`, () => {
    const fixture = TestBed.createComponent(ModulesComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('MMM-ConfigurationUI');
  });

  it('should render title in a h1 tag', () => {
    const fixture = TestBed.createComponent(ModulesComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Welcome to MMM-ConfigurationUI!');
  });
});
