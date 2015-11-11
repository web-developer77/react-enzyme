# Future Work

There are several things we'd like to address with Reagent that often get asked. Here are a couple 
of projects that we plan on addressing in the near future:


### React Native Support

We would like to have reagent provide full support for react components created with React Native,
and potentially some RN-specific methods to facilitate testing there.


### Improved CSS Selector Support

Currently, "hierarchical" CSS selectors are not supported in Reagent. That means that the only CSS
selectors that can be used right now are those that operate on a specific node.  As time progresses
we would like to provide a more complete subset of all valid CSS selectors.


### Improved event simulation and propagation support

Event simulation is limited for Shallow rendering. Event propagation is not supported, and one must
supply their own event objects. We would like to provide tools to more fully simulate real 
interaction.
