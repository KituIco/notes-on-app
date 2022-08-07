import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceHomeComponent } from './space-home.component';

describe('SpaceHomeComponent', () => {
  let component: SpaceHomeComponent;
  let fixture: ComponentFixture<SpaceHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpaceHomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpaceHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
