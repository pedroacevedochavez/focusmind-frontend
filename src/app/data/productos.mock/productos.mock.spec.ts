import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosMock } from './productos.mock';

describe('ProductosMock', () => {
  let component: ProductosMock;
  let fixture: ComponentFixture<ProductosMock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosMock],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductosMock);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
