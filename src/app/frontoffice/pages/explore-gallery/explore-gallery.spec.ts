import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreGallery } from './explore-gallery';

describe('ExploreGallery', () => {
  let component: ExploreGallery;
  let fixture: ComponentFixture<ExploreGallery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExploreGallery]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExploreGallery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
