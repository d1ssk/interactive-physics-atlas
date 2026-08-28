# Ising Model Phase Transition

## Physical idea

The ferromagnetic Ising model is the simplest lattice model in which local
alignment and thermal disorder compete. Each spin has two values, and the
zero-field Hamiltonian is

$$
H=-J\sum_{\langle i,j\rangle}s_i s_j,
\qquad s_i\in\{-1,+1\}.
$$

We set $J=k_B=1$ and use periodic hypercubic lattices. In one dimension there is
no phase transition at positive temperature. The infinite two-dimensional
square lattice has the exact critical temperature

$$
T_c=\frac{2}{\log(1+\sqrt{2})}\simeq2.269185,
$$

while the three-dimensional cubic lattice has the numerical estimate
$T_c\simeq4.511524$. The finite lattices below do not become singular at these
temperatures, but their fluctuations and relaxation change markedly nearby.

## Relevant equations

For a proposed flip of spin $s_i$, the energy change is

$$
\Delta E=2s_i\sum_{j\in\operatorname{nn}(i)}s_j.
$$

Random-sequential single-spin-flip Metropolis dynamics accepts the proposal with

$$
P_{\mathrm{acc}}=\min\!\left(1,e^{-\Delta E/T}\right).
$$

One sweep is $N=L^d$ independently selected proposals; a site may be selected
more than once. The displayed observables are

$$
m=\frac{1}{N}\sum_i s_i,
\qquad
e=\frac{H}{N}.
$$

### Thermodynamic functions

For the infinite 1D chain at $T>0$,

$$
f(T)=-T\log\!\left[2\cosh(1/T)\right],
\qquad
e(T)=-\tanh(1/T),
\qquad
c(T)=\frac{\operatorname{sech}^2(1/T)}{T^2}.
$$

Its spontaneous magnetization is zero for every $T>0$. For the infinite 2D
square lattice, define $\beta=1/T$ and

$$
\kappa=\frac{2\sinh(2\beta)}{\cosh^2(2\beta)}.
$$

The zero-field spontaneous magnetization and internal energy per spin are

$$
m(T)=
\begin{cases}
\left[1-\sinh^{-4}(2/T)\right]^{1/8}, & T<T_c,\\
0, & T\ge T_c,
\end{cases}
$$

$$
e(T)=-\coth(2\beta)
\left[1+\frac{2}{\pi}\left(2\tanh^2(2\beta)-1\right)K(\kappa)\right],
$$

where $K$ is the complete elliptic integral of the first kind. The heat capacity
is $c(T)=de/dT$ and diverges logarithmically at $T_c$. The application evaluates
the plotted 2D heat-capacity curve by finite-differencing the exact energy, so
the displayed peak is finite and depends on chart resolution. No corresponding
closed-form thermodynamic solution is known in 3D; the application therefore
does not draw a purported exact 3D curve.

## Interactive visualization

<iframe src="app/index.html?lang=en" title="Interactive Ising model simulation in one, two, and three dimensions" data-auto-height scrolling="no" style="display: block; width: 100%; height: 2450px; min-height: 1500px; border: 0; overflow: hidden;" loading="eager"></iframe>

## Things to try

1. In 2D, align the lattice at $T=1.5$, then raise the temperature to $T=4$ and
   watch domains dissolve.
2. Select $T_c$ and then $1.01T_c$. Compare the slowly changing large domains
   immediately above the transition with the faster decorrelation farther away.
3. Switch to 1D and wait at a low but positive temperature. Domain walls remain
   thermally possible, consistent with the absence of a finite-$T$ ordered phase.
4. Switch to 3D and move the $z$-slice control. The image changes by slice, while
   $m$ and $e$ continue to use all $L^3$ spins.
5. Reuse the same seed and settings after randomization. The explicit PRNG makes
   the trajectory reproducible when the sequence of control changes is also the same.

## What to notice

Below the 2D or 3D transition, large same-sign domains form and $|m|$ can become
substantial. Above it, thermal disorder keeps the long-run magnetization near
zero for a sufficiently large equilibrated system. Near $T_c$, fluctuations
occur on many length scales and local Metropolis dynamics suffers critical
slowing down.

The thermodynamic curves and the live cards answer different questions. The
curves describe exact infinite-system equilibrium quantities where a solution
is known. The cards show one instantaneous state of a finite Markov chain. A
thermal estimate would require discarding an equilibration interval, measuring
autocorrelation, and averaging sufficiently separated samples.

## Conventions and limitations

The 1D, 2D, and 3D modes use the same random-sequential local Metropolis
convention and periodic boundaries. The 3D canvas shows one selectable 2D
cross-section to keep rendering and Worker snapshots bounded; its observables
are calculated from the complete cubic lattice. This is not a cluster algorithm
and should not be expected to equilibrate efficiently near criticality.

The simulation runs in bounded batches in a JavaScript module Web Worker.
Rendering remains on the main thread, and spin snapshots are transferred as
typed byte buffers. Lower display rate and fewer sweeps per update reduce client
work. No backend, Pyodide, or Wasm runtime is loaded.

Finite size, finite runtime, correlated sampling, and initialization bias all
matter. The visualization is intended for qualitative exploration and
deterministic algorithm checks, not precision determination of critical
exponents or thermodynamic averages.

## References

- L. Onsager, “Crystal Statistics. I. A Two-Dimensional Model with an
  Order-Disorder Transition,” *Physical Review* **65**, 117 (1944).
- C. N. Yang, “The Spontaneous Magnetization of a Two-Dimensional Ising Model,”
  *Physical Review* **85**, 808 (1952).
- M. Hasenbusch, “Finite size scaling study of lattice models in the three-dimensional
  Ising universality class,” *Physical Review B* **82**, 174433 (2010).
- N. Metropolis et al., “Equation of State Calculations by Fast Computing Machines,”
  *Journal of Chemical Physics* **21**, 1087 (1953).
