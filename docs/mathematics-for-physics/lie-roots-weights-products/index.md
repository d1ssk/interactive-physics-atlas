# Lie Roots, Weights, and Tensor Products

## Mathematical idea

A finite-dimensional representation of a compact semisimple Lie algebra can be
organized by its weights. Starting from a dominant integral highest weight, the
visualization constructs the full weight diagram, including internal weight
multiplicities, and decomposes tensor-product characters into irreducible
summands.

## Interactive visualization

<iframe
  src="app/index.html?lang=en"
  title="Interactive Lie roots, weights, and tensor products"
  data-auto-height
  scrolling="no"
  style="display: block; width: 100%; height: 2300px; min-height: 1120px; border: 0; overflow: hidden;"
  loading="eager"
></iframe>

## Things to try

1. Compare $B_2$ and $C_2$: the root sets are dual under the long/short-root convention.
2. Turn on fundamental weights and verify that each $\omega_i$ is dual to the corresponding simple coroot.
3. Select the $A_2$ adjoint representation $(1, 1)$ and inspect the multiplicity of the zero weight.
4. Step through $\mathbf{3}\otimes\mathbf{3}\otimes\mathbf{3}$ for $A_2$ and watch the residual character reach zero.
5. Compare the $B_3$ spinor square with the dimensions of its four irreducible summands.

## Conventions and limitations

Displayed roots are positive when their first nonzero displayed coordinate is
positive. Simple roots are the indecomposable positive roots, ordered to retain
the standard Cartan type, with

$$
A_{ij}=\langle\alpha_i,\alpha_j^\vee\rangle.
$$

Thus the last simple root of $B_r$ is short, the last simple root of $C_r$ is
long, and $G_2$ uses short $\alpha_1$ with Cartan matrix

$$
\begin{pmatrix}2&-1\\-3&2\end{pmatrix}.
$$

The highest-weight explorer precomputes Dynkin labels from 0 through 3. The
tensor-product explorer uses a curated set of small representations so that the
published application remains static, responsive, and independent of a Python
server. These are computational safety limits, not mathematical restrictions.

## References

- J. E. Humphreys, *Introduction to Lie Algebras and Representation Theory*.
- W. Fulton and J. Harris, *Representation Theory: A First Course*.
