import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasecoatSelectComponent } from './basecoat-select.component';

describe('BasecoatSelectComponent', () => {
  let component: BasecoatSelectComponent;
  let fixture: ComponentFixture<BasecoatSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasecoatSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasecoatSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
