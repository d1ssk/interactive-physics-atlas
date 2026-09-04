# Electromagnetic energy flow around a circuit

The published application uses a static browser runtime. Its field model combines
node-wise Laplace basis solutions with complex terminal voltages and evaluates the
instantaneous Poynting vector using a thin-wire Biot–Savart field.

`physics.py` is the compact Python reference model used for invariant tests. The
corresponding browser calculations live in `static/physics.js`; presentation and
interaction live in `static/app.js`.
