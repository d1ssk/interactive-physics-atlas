# Lie Roots, Weights, and Tensor Products

## Mathematical background

Finite-dimensional representations of compact semisimple Lie algebras can be described
systematically in terms of weights. For low-rank Lie algebras, this visualization displays root
systems and weights explicitly and shows how tensor products of representations decompose into
irreducible representations.

The Cartan matrix describes the relation between simple roots and coroots:

$$
A_{ij}=\langle\alpha_i,\alpha_j^\vee\rangle.
$$

The formal character of an irreducible highest-weight representation $V_\lambda$ records every
weight and its multiplicity:

$$
\sum_\mu m_\lambda(\mu)e^\mu.
$$

An irreducible tensor-product decomposition is expressed by the character identity

$$
\operatorname{ch}(V_\lambda\otimes V_\nu)
=\sum_\kappa N_{\lambda\nu}^{\kappa}\operatorname{ch}V_\kappa
$$

The explorer successively identifies the highest weight in the residual character and removes the
character of the corresponding irreducible representation. When the decomposition is complete,
the residual is zero and the dimension of the tensor product equals the sum of the dimensions of
its irreducible components.

## Visualization

<iframe
  src="app/index.html?lang=en"
  title="Lie roots, weights, and tensor products visualization"
  data-auto-height
  scrolling="no"
  style="display: block; width: 100%; height: 2300px; min-height: 1120px; border: 0; overflow: hidden;"
  loading="eager"
></iframe>

## Exploration examples

1. **Duality of root systems**<br>
    Compare the root systems of $B_2$ and $C_2$. Their long and short roots are exchanged, and
    taking coroots makes the two systems geometrically dual to one another.

2. **Fundamental weights and simple coroots**<br>
    Display the fundamental weights $\omega_i$ and verify geometrically that

    $$
    \langle \omega_i,\alpha_j^\vee\rangle=\delta_{ij}
    $$

3. **Weight multiplicities**<br>
    Display the $A_2$ adjoint representation $(1,1)$. Inspect both the outer and internal weights
    and confirm that the zero weight occurs with multiplicity two.

4. **Generate a representation from its highest weight**<br>
    Enter the non-preset $A_2$ highest weight $(4,0)$. Specifying only the highest weight generates
    every weight of the representation and its multiplicity in the browser.

5. **Decompose a two-factor tensor product**<br>
    Enter $V_{(2,0)}\otimes V_{(1,1)}$ for $A_2$ and follow the decomposition as successive highest
    weights are extracted from the residual character.

6. **Decompose a three-factor tensor product step by step**<br>
    Step through $\mathbf{3}\otimes\mathbf{3}\otimes\mathbf{3}$ for $A_2$. The final result is

    $$
    \mathbf{3}\otimes\mathbf{3}\otimes\mathbf{3}
    =
    \mathbf{10}\oplus\mathbf{8}\oplus\mathbf{8}\oplus\mathbf{1}
    $$

    and the residual character reaches zero.

7. **Tensor square of the spinor representation**<br>
    Decompose the tensor square of the eight-dimensional spinor representation $\mathbf{8}$ of
    $B_3$ and verify that

    $$
    \mathbf{8}\otimes\mathbf{8}
    =
    \mathbf{1}\oplus\mathbf{7}\oplus\mathbf{21}\oplus\mathbf{35}
    $$

    Also verify

    $$
    1+7+21+35=64=8^2
    $$

    so that the dimensions of the irreducible components sum to the dimension of the original
    product representation.

## Mathematics shown here

- **Duality of roots and coroots**<br>
  The root systems $B_2$ and $C_2$ are not merely similar in shape; exchanging roots and coroots
  makes them dual. The exchange of long and short roots expresses this duality geometrically.

- **Weights have multiplicities**<br>
  A point in a weight diagram does not necessarily represent only one state. Within a
  representation, several independent states may have the same weight. The zero weight with
  multiplicity two in the $A_2$ adjoint representation is the simplest example.

- **A highest weight determines an irreducible representation**<br>
  Finite-dimensional irreducible representations are classified by their highest weights.
  Therefore, specifying Dynkin labels $(a_1,\ldots,a_r)$ reconstructs the weights and
  multiplicities of the representation.

- **Tensor-product decomposition can be tracked by character subtraction**<br>
  Repeatedly find the highest weight in the product character and remove the irreducible character
  having that highest weight. At each step,

    $$
    \text{original product character}
    =
    \text{extracted irreducible characters}
    +
    \text{residual character}
    $$

    and the residual character is zero when the decomposition is complete.

## Root-system conventions

In the displayed coordinates, a root is positive when its first nonzero component is positive.
Simple roots are chosen as the positive roots that cannot be written as the sum of two positive
roots, and they are ordered according to the standard Cartan types.

Under this convention, the last simple root of $B_r$ is short and the last simple root of $C_r$ is
long.

For $G_2$, $\alpha_1$ is the short root and $\alpha_2$ is the long root. With the convention

$$
A_{ij}=\langle\alpha_i,\alpha_j^\vee\rangle
$$

the Cartan matrix is

$$
\begin{pmatrix}
2 & -1\\
-3 & 2
\end{pmatrix}
$$
