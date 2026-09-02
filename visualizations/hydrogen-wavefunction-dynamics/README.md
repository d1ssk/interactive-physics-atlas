# Hydrogen Wavefunction

A static browser application for constructing normalized superpositions of nonrelativistic
hydrogen eigenstates. It animates the exact phase factor for every energy eigenstate and renders
the evolving complex phase and probability density as an importance-weighted point cloud.

The Python physics layer defines the conventions and supplies independently testable reference
calculations. The versioned browser domain module implements the same formulas for interactive
rendering; executable parity vectors guard the two implementations against drift.

Build through the repository visualization pipeline. Direct `file://` viewing is unsupported;
serve the generated site over loopback HTTP for browser QA.
