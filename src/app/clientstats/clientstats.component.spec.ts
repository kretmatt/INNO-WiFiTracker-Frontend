import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientstatsComponent } from './clientstats.component';

describe('ClientstatsComponent', () => {
  let component: ClientstatsComponent;
  let fixture: ComponentFixture<ClientstatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientstatsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientstatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
