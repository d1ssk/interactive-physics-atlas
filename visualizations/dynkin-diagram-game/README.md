# Dynkin Diagram Builder

An SVG-based construction game for finite crystallographic Dynkin diagrams.
The Python physics layer generates the authoritative rank-eight catalogue and
checks Cartan-matrix invariants. The static browser UI edits nodes and bonds and
matches connected components against that catalogue without a Python runtime.

## Convention

The Cartan matrix is

```text
A_ij = <alpha_i, alpha_j^vee>.
```

An arrow on a multiple bond points toward the shorter simple root. Connected
finite types and disconnected semisimple products are accepted through total
rank eight.
