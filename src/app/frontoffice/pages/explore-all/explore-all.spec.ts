import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreAll } from './explore-all';

describe('ExploreAll', () => {
  let component: ExploreAll;
  let fixture: ComponentFixture<ExploreAll>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExploreAll]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExploreAll);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
