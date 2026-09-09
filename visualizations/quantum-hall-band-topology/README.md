# Chern insulators and bulk–edge correspondence

This publication visualization combines four linked views in one bilingual
static application.
The article embeds that application four times using the `panel` query parameter:

- `map`: the square Brillouin zone, its colored three-dimensional torus, and its
  image on the Bloch sphere;
- `transition`: rotatable upper and lower QWZ energy surfaces over the full Brillouin zone;
- `winding`: SSH bands and the winding of the off-diagonal Bloch Hamiltonian;
- `edge`: finite-chain spectral flow and the two central-state densities.

The two-dimensional convention is

$$
H(\mathbf k)=\sum_{a=x,y,z}d_a(\mathbf k)\sigma_a,
\qquad
\mathbf d=(A\sin k_x,-\lambda\sin k_y,m+\cos k_x+\cos k_y).
$$

The reported Chern number belongs to the negative-energy band. With
$A\lambda>0$, increasing $m$ gives $0,+1,-1,0$, with gap closings at
$m=-2,0,2$. At $m=0$, the X and Y points close simultaneously.

The SSH chain begins and ends with the intracell $t_1$ bond. At finite length,
the two edge modes generally hybridize into a pair at $\pm\varepsilon$.

Run the focused tests with:

```bash
uv run pytest visualizations/quantum-hall-band-topology/tests -q
```
