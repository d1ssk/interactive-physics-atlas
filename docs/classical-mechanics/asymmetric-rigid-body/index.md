# Torque-Free Rotation of an Asymmetric Rigid Body

## Intermediate-axis theorem

Consider an asymmetric rigid body whose principal moments satisfy

$$
I_1<I_2<I_3
$$

Steady rotation about either the smallest- or largest-moment principal axis is stable, whereas rotation about the intermediate principal axis is unstable. Even without an external torque, a slight displacement from the intermediate axis grows and the body periodically undergoes a large flip. This property is the **intermediate-axis theorem**, also called the tennis-racket theorem.

In the inertial frame, the angular momentum vector $\mathbf L$ is constant. In the body frame, which rotates with the rigid body, its components change with time. Comparing the body's motion in the inertial frame with the trajectory of $\mathbf L$ in the body frame makes this distinction geometrically visible.

## Visualization

<iframe src="app/index.html?lang=en" title="Torque-free rotation and an impulse-driven asymmetric rigid-body challenge" style="display: block; width: 100%; height: 3000px; min-height: 1100px; border: 0; overflow: hidden;" loading="eager" scrolling="no" data-auto-height></iframe>

### Apply an impulse yourself

The lower panel starts with the same body at rest. Its six grip points are the intersections of the surface with the positive and negative principal axes. Starting a drag on one of these points specifies an impulse $mathbf J$ at the body-fixed position $mathbf r$. On release, the body's angular momentum changes by

$$
\Delta\mathbf L=\mathbf r\times\mathbf J
$$

The center of mass is constrained, so the visualization retains only this rotational impulse and does not display translation. After release, the external torque again vanishes and the body follows the torque-free Euler equations. A drag that starts anywhere other than a grip point rotates the camera instead.

While aiming, the readouts show the nearest principal axis and the angular error. For a launch nearest to the intermediate axis, the timer records the first reversal for which the signed body-frame component satisfies $L_2/|\mathbf L|\leq -0.98$ relative to its launch direction. This operational threshold distinguishes a visually complete flip from merely crossing the plane $L_2=0$.

## Euler equations and conserved quantities

Choose the principal axes as the body-frame coordinate axes. The inertia tensor is then

$$
\mathbf I=\operatorname{diag}(I_1,I_2,I_3),
\qquad
\mathbf L=\mathbf I\mathbf{\omega}
$$

For any vector $\mathbf A$, its time derivatives in the inertial and body frames are related by

$$
\left(\frac{d\mathbf A}{dt}\right)_{\mathrm{space}}
=
\left(\frac{d\mathbf A}{dt}\right)_{\mathrm{body}}
+
\mathbf{\omega}\times\mathbf A
$$

If the external torque vanishes, then

$$
\left(\frac{d\mathbf L}{dt}\right)_{\mathrm{space}}=0
$$

so in the body frame

$$
\dot{\mathbf L}
=
\mathbf L\times\mathbf{\omega}
$$

This is the Euler equation for a torque-free rigid body. In principal-axis components, it becomes

$$
\begin{aligned}
I_1\dot\omega_1&=(I_2-I_3)\omega_2\omega_3,\\
I_2\dot\omega_2&=(I_3-I_1)\omega_3\omega_1,\\
I_3\dot\omega_3&=(I_1-I_2)\omega_1\omega_2
\end{aligned}
$$

The magnitude of angular momentum,

$$
L^2=L_1^2+L_2^2+L_3^2
$$

and the rotational energy,

$$
E=
\frac{L_1^2}{2I_1}
+\frac{L_2^2}{2I_2}
+\frac{L_3^2}{2I_3}
$$

are conserved. Consequently, the tip of $\mathbf L$ in the body frame moves along the intersection of the angular-momentum sphere

$$
L_1^2+L_2^2+L_3^2=L^2
$$

and the energy ellipsoid

$$
\frac{L_1^2}{2I_1}
+\frac{L_2^2}{2I_2}
+\frac{L_3^2}{2I_3}
=E
$$

Indeed,

$$
\mathbf L\cdot\dot{\mathbf L}=0,
\qquad
\mathbf{\omega}\cdot\dot{\mathbf L}=0
$$

so $\dot{\mathbf L}=\mathbf L\times\mathbf{\omega}$ is tangent to both conserved-quantity surfaces.

The two conserved quantities constrain the motion to a one-dimensional intersection curve in the three-dimensional $\mathbf L$ space. The Euler equation determines the direction and speed of motion along that curve. Determining the body's orientation in the inertial frame additionally requires integrating the attitude dynamics.

## Why only the intermediate axis is unstable

On a sphere of fixed $L$, the rotational energy has extrema at the points corresponding to the smallest- and largest-moment principal axes, but the point corresponding to the intermediate principal axis is a saddle point.

Consider a steady rotation about the intermediate axis,

$$
\mathbf L=(0,L_0,0)
$$

and its neighborhood. On the angular-momentum sphere,

$$
L_2\simeq
L_0-\frac{\delta L_1^2+\delta L_3^2}{2L_0}
$$

The energy of the intermediate-axis rotation is

$$
E_2=\frac{L_0^2}{2I_2}
$$

and the nearby energy difference is therefore

$$
E-E_2\simeq
\frac12
\left[
\left(\frac1{I_1}-\frac1{I_2}\right)\delta L_1^2
+
\left(\frac1{I_3}-\frac1{I_2}\right)\delta L_3^2
\right]
$$

Because $I_1<I_2<I_3$, the two coefficients have opposite signs. The intermediate-axis point is therefore a saddle rather than an energy extremum, and nearby constant-energy curves do not form small closed loops around it. In particular, the $E=E_2$ trajectory forms a separatrix through the saddle. Motion close to it carries $\mathbf L$ far away from the neighborhood of the intermediate axis.

Around the smallest- and largest-moment principal axes, by contrast, the corresponding quadratic terms have the same sign, so nearby constant-energy curves are closed loops around the axis. This is the geometric reason rotation is stable about those two axes and unstable only about the intermediate axis.

## Explorations

1. Select **axis 1** and verify that $\mathbf L$ remains on a small closed body-frame orbit around the $I_1$ axis.
2. Select **axis 3** and compare it with axis 1. Both rotations are stable, but the orbit shapes and time scales differ because the moments of inertia are unequal.
3. Select **axis 2** and follow the purple $\dot{\mathbf L}$ vector drawn from the tip of $\mathbf L$. It shows the instantaneous direction of motion along the yellow intersection curve.
4. Reduce the initial displacement. The instability remains, but the body spends longer near intermediate-axis rotation before it flips.
5. Pause the animation, rotate the body-frame view, and verify that $\dot{\mathbf L}$ is tangent to both the angular-momentum sphere and the energy ellipsoid at the current point.
6. In the lower panel, drag a grip point until the readout identifies **axis 2**, then release and time the first flip.
7. Repeat with a smaller launch error. The body remains close to intermediate-axis rotation for longer before the error grows into a flip.
8. Aim for **axis 1** or **axis 3** and compare the bounded wobble with the intermediate-axis launch. Use **Stop** to inspect the attitude and **Reset** to return the body to rest.

Exact rotation about any principal axis is a solution of the Euler equations. Here, “unstable” does not mean that a state perfectly aligned with the intermediate axis spontaneously departs from it. It means that any arbitrarily small transverse perturbation grows with time.

Nor is the angular momentum vector $\mathbf L$ flipping in the inertial frame. It remains fixed in space while the body's orientation changes substantially around it. As a result, from the body frame rotating with the rigid body, the components of $\mathbf L$ appear to travel widely across the angular-momentum sphere.
