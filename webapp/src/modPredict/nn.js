// This file includes neural network weights and biases for each variable to be
// predicted using modPredict. Weights and biases are defined in 'nn' variable,
// which is split into binary fields, numeric fields, yes/no scales and likert
// scales. Example of 'nn' variable structure is provided below. Example script
// 'training/train.py' outputs results compatible with this structure.

/* 
nn = {
        binfields: {                                                            // Neural networks for binary demographic fields 
            gender: [                                                           // Neural network for field 'gender'
                [                                                               // Layer 1
                    [                                                           // Layer 1 weights
                        [weight_1_1, weight_1_2, ..., weight_1_y],
                        [weight_2_1, weight_2_2, ..., weight_2_y],
                         ...
                        [weight_x_1, weight_x_2, ..., weight_x_y]
                    ],
                    [bias_1, bias_2, ... bias_y]                                // Layer 1 biases
                ],
                [                                                               // Layer 2
                    [                                                           // Layer 2 weights
                        [weight_1_1, weight_1_2, ..., weight_1_y],
                        [weight_2_1, weight_2_2, ..., weight_2_y],
                         ...
                        [weight_x_1, weight_x_2, ..., weight_x_y]
                    ],
                    [bias_1, bias_2, ... bias_y]                                // Layer 2 biases
                ],
                ...
            ]
        },
        numfields: {...},                                                       // NN for numerical demographic fields (catagorical) 
        scales: [                                                               // NN for binary scales dimensions
            {
                foo: []                                                         // NN for scale 1 dimension 'foo'
                ...
            },
            {
                bar: []                                                         // NN for scale 2 dimension 'bar'
                ...
            }
            ...
        ],
        lscales: [{foo:[],...},{bar:[],...},...]                                // NN for likert scales dimensions (same structure as above)
    }
*/
nn = {
    scales: [
        {
            sample_dimension: [
                [                                                                               
                    [
                        [
                            0.36876770853996277,
                            0.8036144971847534,
                            0.7637225985527039,
                            1.1159255504608154,
                            -0.958660900592804,
                            0.9285246133804321,
                            1.2883259057998657,
                            -0.8756102919578552
                        ],
                        [
                            -1.7851009368896484,
                            0.058900460600852966,
                            -0.2541326880455017,
                            -0.7166588306427002,
                            1.0006686449050903,
                            1.8789558410644531,
                            0.2905387282371521,
                            0.33043044805526733
                        ],
                        [
                            2.811472177505493,
                            -0.5263358354568481,
                            0.643531084060669,
                            -2.1496565341949463,
                            0.2848688066005707, 
                            2.227104663848877,
                            -0.9622727632522583,
                            0.1623259037733078
                        ],
                        [
                            0.9359235167503357,
                            0.584684431552887,
                            0.6145641803741455,
                            -0.6441674828529358,
                            2.6090712547302246,
                            0.29088079929351807,
                            0.5900102853775024,
                            0.8817198872566223],
                        [
                            0.4354020655155182,
                            -0.3075381815433502,
                            -1.0923866033554077,
                            -0.7310360670089722,
                            0.1342085897922516,
                            -1.3875658512115479,
                            -0.5815232992172241,
                            -0.7272304892539978
                        ],
                        [
                            -1.7533786296844482,
                            2.1722183227539062,
                            -1.0760852098464966,
                            0.0272714514285326,
                            0.9456288814544678,
                            -2.126622200012207,
                            2.0134027004241943,
                            -0.3493441343307495
                        ],
                        [
                            0.7989464998245239,
                            2.3066792488098145,
                            0.845099687576294,
                            0.09336976706981659,
                            0.5557838678359985,
                            -0.15810789167881012,
                            -0.3724013566970825,
                            0.5287145376205444
                        ],
                        [
                            -0.10190796852111816,
                            0.42555147409439087,
                            0.5792995095252991,
                            -1.130383014678955,
                            -0.8205096125602722,
                            -1.2498224973678589,
                            -1.4419729709625244,
                            -0.3050216734409332
                        ],
                        [
                            0.2715165913105011,
                            0.6771520972251892,
                            -1.7969200611114502,
                            -0.30789291858673096,
                            -0.766478955745697,
                            -1.205881953239441,
                            0.4564206302165985,
                            -0.8185632824897766
                        ],
                        [
                            0.19365611672401428,
                            -0.3723636567592621,
                            -0.6145420074462891,
                            0.7245643734931946,
                            -0.21946968138217926,
                            -0.6759192943572998,
                            0.19768084585666656,
                            0.042206160724163055
                        ]
                    ],
                    [
                        -1.5569467544555664,
                        -1.6456462144851685,
                        1.0204122066497803,
                        -1.08733069896698,
                        -0.08133456856012344,
                        0.07298920303583145,
                        -1.1127232313156128,
                        -0.14574100077152252
                    ]
                ],                                                                      
                [                                                                       
                    [
                        [
                            -0.2570481300354004,
                            -0.04688527435064316
                        ],
                        [
                            1.043099045753479,
                            -0.4966849982738495
                        ],
                        [
                            -0.1084175556898117,
                            2.313419818878174
                        ],
                        [
                            -0.33980071544647217,
                            -0.462219774723053
                        ],
                        [
                            0.3985392153263092,
                            -0.8918282985687256 
                        ], 
                        [
                            -2.8490777015686035,
                            -0.06130657717585564
                        ],
                        [
                            1.2028053998947144,
                            -1.2317924499511719
                        ],
                        [
                            1.8393291234970093,
                            0.5883274078369141
                        ]
                    ],
                    [
                        -0.4505283236503601,
                        -0.20927360653877258
                    ]                     
                ]                                                                       
            ]   
        }
    ]
}
