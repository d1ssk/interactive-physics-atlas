# Dynkin Diagram Builder

## Mathematical idea

A Dynkin diagram packages the pairwise geometry of a set of simple roots. Each
node represents one simple root. Bonds encode the products
$A_{ij}A_{ji}$ of off-diagonal Cartan-matrix entries, while an arrow distinguishes
the short root from the long root on a multiple bond.

The finite crystallographic diagrams classify finite-dimensional complex
semisimple Lie algebras. Connected diagrams give the simple factors; a
disconnected diagram represents their direct sum.

## Interactive visualization

<iframe
  src="app/index.html?lang=en"
  title="Interactive Dynkin diagram builder"
  data-auto-height
  scrolling="no"
  style="display: block; width: 100%; height: 2200px; min-height: 1380px; border: 0; overflow: hidden;"
  loading="eager"
></iframe>

## Things to try

1. Build $A_4$ with four nodes and three single bonds.
2. Add one branch to $A_4$ and rearrange the nodes until the result is recognized as $D_4$.
3. Compare $B_3$ and $C_3$ by reversing the arrow on their double bond.
4. Construct $G_2$ from two nodes joined by a triple bond.
5. Make a disconnected $A_2\times A_1$ diagram and observe its semisimple classification.
6. Select challenge mode and rebuild an exceptional diagram without using its standard layout.

## Conventions and limitations

We use

$$
A_{ij}=\langle\alpha_i,\alpha_j^\vee\rangle
$$

An arrow on a double or triple bond points toward the shorter simple root.
Classification is independent of node position and node numbering. The editor
recognizes finite crystallographic types through total rank eight:
$A_n$, $B_n$, $C_n$, $D_n$, $E_6$, $E_7$, $E_8$, $F_4$, and $G_2$.

The rank limit is an interface scope, not a mathematical cutoff for the
classical families. The aliases $B_2=C_2$, $D_3=A_3$, and
$D_2=A_1\times A_1$ are reported without duplicating indistinguishable diagrams.

### Finite-type criterion

For a generalized Cartan matrix to define a finite crystallographic Dynkin
diagram:

1. $A_{ii}=2$, the off-diagonal entries are non-positive integers, and
   $A_{ij}=0$ exactly when $A_{ji}=0$.
2. There are positive integers $d_i$ such that $DA$ is symmetric for
   $D=\operatorname{diag}(d_i)$.
3. The symmetric matrix $DA$ is positive definite.

The third condition distinguishes finite type from affine and indefinite
generalized Cartan matrices. Diagrammatically, every connected finite component
is one of the $A$, $B$, $C$, $D$, $E$, $F$, or $G$ trees: it has no cycles, no
node of degree greater than three, and at most one multiple bond. Those simple
shape rules are necessary but not sufficient by themselves; branch lengths,
multiple-bond placement, and arrow direction must match one of the classified
families.

For the classical series, the application also shows standard compact-group
notation:

- $A_n$: $SU(n+1)$
- $B_n$: $SO(2n+1)$ and its simply connected cover $\operatorname{Spin}(2n+1)$
- $C_n$: $Sp(n)$
- $D_n$: $SO(2n)$ and its simply connected cover $\operatorname{Spin}(2n)$

These labels identify compact groups with the corresponding Lie algebra; the
Dynkin diagram alone does not determine the global form of the group.

## References

- J. E. Humphreys, *Introduction to Lie Algebras and Representation Theory*.
- V. G. Kac, *Infinite-Dimensional Lie Algebras*.
