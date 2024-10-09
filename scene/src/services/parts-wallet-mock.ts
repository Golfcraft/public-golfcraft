const allPartAliases =['basic_bigwave', 'basic_slope', 'basic_stepSlope', 'basic_halframp', 'basic_loop', 'basic_centreBump', 'basic_cylinder', 'basic_curve', 'basic_concave_corner', 'basic_sidebend', 'basic_hole', 'basic_floor', 'basic_Floor_teeth', 'basic_ramp', 'basic_wall', 'basic_border', 'basic_Floor_dpath', 'basic_cube', 'basic_small_border', 'basic_ramp_border', 'basic_low_slope', 'basic_concave_halfcorner', 'basic_thinpath1', 'basic_border_plank'];

export const getWalletParts = async () => {
    //TODO theGraph from parts contract
    return allPartAliases.reduce((acc:any, alias)=>{
       /* const have = Math.floor(Math.random()*3);
        const amount = have?(1+Math.floor(Math.random()*40)):0;
        acc[alias] = amount;*/
        acc[alias] = 0;
        return acc;
    }, {})
}