# Lorentz Transformation

A Lorentz boost relates the space and time coordinates assigned to the same physical event by different inertial coordinate systems while preserving the spacetime interval.

## Visualization

<iframe src="app/index.html?lang=en" title="Lorentz transformation between two inertial coordinate systems" data-auto-height scrolling="no" style="display: block; width: 100%; height: 1450px; min-height: 1000px; border: 0; overflow: hidden;" loading="eager"></iframe>

## What to notice

The red point represents one physical event $P$. The blue-gray frame $S$ assigns this event coordinates $(x,ct)$, while the teal frame $S'$ assigns it coordinates $(x',ct')$.

Suppose that $S'$ moves with speed $v$ in the positive $x$ direction relative to $S$, and define

$$
\beta=\frac{v}{c}
$$

Then the Lorentz transformation between the two frames is

$$
x'=\gamma(x-\beta ct),\qquad
ct'=\gamma(ct-\beta x),
$$

where

$$
\gamma=\frac{1}{\sqrt{1-\beta^2}}
$$

The coordinates of $P$ can be read using guide lines parallel to the coordinate axes. For example, the line through $P$ parallel to a frame's time axis intersects its space axis at the spatial coordinate. Similarly, the line parallel to its space axis intersects the time axis at the time coordinate.

Use **Orthogonal display** to exchange whether $S$ or $S'$ is shown as the orthogonal reference frame on the screen. When one frame is displayed orthogonally, the other frame's time and space axes appear oblique.

This switch changes only the displayed reference basis; neither inertial frame is physically preferred. In either display, light worldlines remain at $45^\circ$, and the spacetime interval

$$
s^2=(ct)^2-x^2=(ct')^2-(x')^2
$$

remains invariant.

## Suggested explorations

1. Drag $P$ and compare $(x,ct)$ and $(x',ct')$, as read from the coordinate axes, with the numerical readouts.

2. Increase $|\beta|$ and switch the orthogonal display between $S$ and $S'$. Confirm that the relation between the two inertial frames is reciprocal and that neither has a privileged role.

3. Place $P$ on one of the dashed light worldlines. In both coordinate systems,

    $$
    |x|=|ct|,\qquad |x'|=|ct'|
    $$

    Confirm that these relations hold.

4. Open **Time dilation** and **Length contraction**, play the hyperbolic-rotation animation representing a Lorentz boost, and then move the progress slider manually. Observe how both effects emerge from the same Minkowski geometry.

## Time dilation

In the time-dilation construction, the orange segment preserves the timelike spacetime interval

$$
(c\Delta\tau)^2
$$

as it changes toward the other frame's time axis.

When the segment aligns with that time axis, its two endpoints represent two events occurring at the same position of a clock at rest in that frame. If the proper time measured by this clock is $\Delta\tau$, the coordinate-time interval between the two events measured in the other inertial frame is

$$
\Delta t=\gamma\Delta\tau
$$

Therefore, for a clock moving relative to an inertial frame, the proper time $\Delta\tau$ elapsed between two events on the clock is shorter than the coordinate time $\Delta t$ in that frame. This is time dilation.

The horizontal guide in the diagram marks events that are simultaneous in the orthogonally displayed frame. It shows geometrically how the moving clock's worldline is related to simultaneity in that frame.

## Length contraction

In the length-contraction construction, the orange segment preserves the spacelike interval

$$
-L_0^2
$$

as it changes toward the other frame's space axis.

When the segment lies on the space axis of the rod's rest frame, its endpoints are two events simultaneous in that frame. The length measured in this case,

$$
L_0
$$

is the rod's **proper length**.

To measure the rod's length in a frame where the rod is moving, the positions of its endpoints must instead be compared at the **same time** in that frame. The two events defining the proper length therefore cannot be used directly; one must select two different events on the endpoints' worldlines that are simultaneous in the observing frame.

The resulting length is

$$
L=\frac{L_0}{\gamma}
$$

so the moving rod is measured to be shorter along its direction of motion.

Time dilation and length contraction appear to be distinct phenomena, but both are geometric consequences of the Lorentz transformation and the relativity of simultaneity in the same Minkowski spacetime.

## Conventions and limitations

The diagram uses coordinates $(x,ct)$ and the Minkowski metric signature

$$
(+,-)
$$

with $c=1$ for the display.

A positive $\beta$ means that $S'$ moves in the positive $x$ direction relative to $S$. Only one spatial direction is shown, and both $S$ and $S'$ are inertial coordinate systems.

The ordinary Euclidean lengths and angles visible on the screen generally have no direct physical meaning. The invariant geometric quantity is not the screen distance but the Minkowski spacetime interval

$$
s^2=(ct)^2-x^2
$$
