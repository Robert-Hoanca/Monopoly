import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudItemComponent } from './cloud-item.component';

describe('CloudItemComponent', () => {
  let component: CloudItemComponent;
  let fixture: ComponentFixture<CloudItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloudItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloudItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
