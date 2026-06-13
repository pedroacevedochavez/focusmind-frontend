import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoModel } from './producto.model';

describe('ProductoModel', () => {
  let component: ProductoModel;
  let fixture: ComponentFixture<ProductoModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoModel],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoModel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
