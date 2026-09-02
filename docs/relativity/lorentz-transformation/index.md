# Lorentz Transformation

A Lorentz boost changes the space and time coordinates assigned to one event while preserving its spacetime interval.

## Visualization

<iframe src="app/index.html?lang=en" title="Lorentz transformation between two inertial coordinate systems" data-auto-height scrolling="no" style="display: block; width: 100%; height: 1450px; min-height: 1000px; border: 0; overflow: hidden;" loading="eager"></iframe>

## What to notice

The red point is one physical event $P$. The blue-gray frame $S$ assigns it coordinates $(x,ct)$, while the teal frame $S'$ assigns it $(x',ct')$. For relative speed $\beta=v/c$, the coordinates are related by

$$
x'=\gamma(x-\beta ct),\qquad
ct'=\gamma(ct-\beta x)
$$

with

$$
\gamma=\frac{1}{\sqrt{1-\beta^2}}
$$

The dashed guide through $P$ parallel to a frame's time axis meets that frame's space axis at its spatial coordinate. The guide parallel to its space axis similarly identifies the time coordinate. These are oblique coordinate projections, not Euclidean perpendicular projections.

Use **Orthogonal display** to exchange the roles of $S$ and $S'$. The previously oblique axes become orthogonal while the previously orthogonal axes become oblique. Neither frame is physically preferred. During this change of displayed basis, the light lines remain at $45^\circ$ and the interval remains

$$
s^2=(ct)^2-x^2=(ct')^2-(x')^2
$$

## Suggested explorations

1. Drag $P$ and compare the four axis intersections with the numerical coordinate readouts.
2. Increase $|\beta|$ and switch the orthogonal display between $S$ and $S'$. Notice that the two descriptions are reciprocal.
3. Place $P$ on a dashed light line. Its spatial and time coordinates have equal magnitudes in both frames.
4. Open **Time dilation** and **Length contraction**. Replay the hyperbolic rotation, then move its progress slider manually.

## Time dilation

In the time-dilation construction, the orange segment retains the timelike interval $(c\Delta\tau)^2$ while it tilts toward the other frame's time axis. When it reaches that axis, its endpoint represents a clock at rest in the other frame after proper time $\Delta\tau$. The coordinate-time separation in the orthogonally displayed frame is

$$
\Delta t=\gamma\Delta\tau
$$

The lower horizontal guide marks events simultaneous in the orthogonally displayed frame. The transformed clock endpoint lies above this guide because a larger coordinate time $\Delta t$ elapses between the same pair of moving-clock events.

## Length contraction

For the length construction, the orange segment retains the spacelike interval $-L_0^2$ while it tilts toward the other frame's space axis. Its endpoints are simultaneous in the rod's rest frame and define its proper length $L_0$.

To measure the moving rod in the orthogonally displayed frame, its endpoints must instead be selected at the same coordinate time in that frame. Projecting the moving endpoint along its worldline gives

$$
L=\frac{L_0}{\gamma}
$$

Time dilation and length contraction therefore use different simultaneity comparisons, although both follow from the same Lorentz geometry.

## Conventions and limitations

The diagram uses $c=1$, coordinates $(x,ct)$, and metric signature $(+,-)$. A positive $\beta$ means that $S'$ moves in the positive $x$ direction of $S$. Only one spatial dimension is shown, and both frames are inertial. The Euclidean lengths and angles drawn on the screen are a coordinate representation; the invariant physical quantity is the Minkowski interval, not the ordinary screen distance.
