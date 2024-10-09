export const getImageSrc = (name) => `images/${name}.png`;
export const compose = (...fns) => fns.reduceRight(compose2);

const compose2 = (f, g) => (...args) => f(g(...args))
