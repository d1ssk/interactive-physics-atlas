# Lie Roots, Weights, and Tensor Products

## Mathematical idea

A finite-dimensional representation of a compact semisimple Lie algebra can be
organized by its weights. Starting from a dominant integral highest weight, the
visualization constructs the full weight diagram, including internal weight
multiplicities, and decomposes tensor-product characters into irreducible
summands.

## Interactive visualization

<iframe
  src="app/index.html"
  title="Interactive Lie roots, weights, and tensor products"
  data-auto-height
  scrolling="no"
  style="display: block; width: 100%; height: 2300px; min-height: 1120px; border: 0; overflow: hidden;"
  loading="eager"
></iframe>

## Things to try

1. Compare `B2` and `C2`: the root sets are dual under the long/short-root convention.
2. Turn on fundamental weights and verify that each `omega_i` is dual to the corresponding simple coroot.
3. Select the `A2` adjoint representation `(1, 1)` and inspect the multiplicity of the zero weight.
4. Step through `3 x 3 x 3` for `A2` and watch the residual character reach zero.
5. Compare the `B3` spinor square with the dimensions of its four irreducible summands.

## Conventions and limitations

Displayed roots are positive when their first nonzero displayed coordinate is
positive. Simple roots are the indecomposable positive roots, ordered to retain
the standard Cartan type, with
`A_ij = <alpha_i, alpha_j^vee>`. Thus the last simple root of `B_r` is short,
the last simple root of `C_r` is long, and `G2` uses short `alpha_1` with Cartan
matrix `[[2, -1], [-3, 2]]`.

The highest-weight explorer precomputes Dynkin labels from 0 through 3. The
tensor-product explorer uses a curated set of small representations so that the
published application remains static, responsive, and independent of a Python
server. These are computational safety limits, not mathematical restrictions.

## Checks performed

- Freudenthal multiplicities sum to the Weyl dimension.
- Tensor-product multiplicities sum to the product of factor dimensions.
- Irreducible summands reproduce the complete product character weight by weight.
- Fundamental weights satisfy `<omega_i, alpha_j^vee> = delta_ij`.
- Root counts, positivity, and Cartan conventions are tested for every supported system.

## References

- J. E. Humphreys, *Introduction to Lie Algebras and Representation Theory*.
- W. Fulton and J. Harris, *Representation Theory: A First Course*.
