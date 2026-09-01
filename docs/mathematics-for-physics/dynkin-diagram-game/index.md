# Dynkin Diagram Builder

## Mathematical background

A Dynkin diagram encodes the relative geometry of simple roots combinatorially. Each node
corresponds to one simple root. The number of bonds joining two nodes is determined by the product
$A_{ij}A_{ji}$ of off-diagonal Cartan-matrix entries, while an arrow on a multiple bond
distinguishes the short root from the long root.

Finite-type Dynkin diagrams classify finite-dimensional complex semisimple Lie algebras. A
connected Dynkin diagram corresponds to a simple Lie algebra, while a disconnected diagram
corresponds to a direct sum of simple Lie algebras.

## Visualization

<iframe
  src="app/index.html?lang=en"
  title="Dynkin Diagram Builder"
  data-auto-height
  scrolling="no"
  style="display: block; width: 100%; height: 2200px; min-height: 1380px; border: 0; overflow: hidden;"
  loading="eager"
></iframe>

## Exploration examples

1. Join four nodes in a line with three single bonds to construct $A_4$.

2. Rearrange the $A_4$ configuration into a branching shape to construct a diagram recognized as
   $D_4$.

3. Reverse the arrow on a double bond and compare the difference between $B_3$ and $C_3$.

4. Join two nodes with a triple bond to construct $G_2$.

5. Build the disconnected diagram $A_2\times A_1$ and confirm that it corresponds to a direct sum
   of simple Lie algebras.

6. Select challenge mode and reconstruct an exceptional Dynkin diagram without using its standard
   layout.

## Conventions and limitations

We use the Cartan-matrix convention

$$
A_{ij}=\langle\alpha_i,\alpha_j^\vee\rangle
$$

An arrow on a double or triple bond points toward the shorter simple root. The type of a Dynkin
diagram is independent of node position and node numbering.

The editor recognizes the finite types through rank eight,

$A_n$, $B_n$, $C_n$, $D_n$, $E_6$, $E_7$, $E_8$, $F_4$, $G_2$.

The rank-eight limit is an interface constraint and does not imply a mathematical rank limit for
the classical families. The low-rank isomorphisms

$$
B_2=C_2,\qquad D_3=A_3,\qquad D_2=A_1\times A_1
$$

are not reported as duplicate types.

### Finite-type criterion

The conditions for a generalized Cartan matrix to define a finite-type Dynkin diagram can be
summarized as follows.

1. $A_{ii}=2$, the off-diagonal entries are non-positive integers, and $A_{ij}=0$ if and only if
   $A_{ji}=0$.

2. For $D=\operatorname{diag}(d_i)$, there are positive $d_i$ such that $DA$ is symmetric. In
   finite type, the $d_i$ may be chosen to be positive integers.

3. The symmetric matrix $DA$ is positive definite.

The third condition distinguishes finite type from affine and indefinite generalized Cartan
matrices.

Diagrammatically, every connected component of a finite-type diagram is a tree of type $A$, $B$,
$C$, $D$, $E$, $F$, or $G$. It has no cycles, no node of degree four or greater, and at most one
multiple bond. These shape conditions alone are not sufficient for finite type: the branch lengths,
the position of the multiple bond, and the arrow direction must also match one of the classified
Dynkin diagrams.

For the classical series, the application also displays the corresponding standard compact-group
notation.

- $A_n$: $SU(n+1)$
- $B_n$: $SO(2n+1)$ and its simply connected cover $\operatorname{Spin}(2n+1)$
- $C_n$: $Sp(n)$
- $D_n$: $SO(2n)$ and its simply connected cover $\operatorname{Spin}(2n)$

These labels denote representative compact Lie groups with the corresponding Lie algebras. A
Dynkin diagram determines only the Lie algebra, not the global form of the group, such as whether
it is simply connected or a quotient by its center.
