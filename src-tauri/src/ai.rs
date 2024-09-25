use candle_core::Device;
use candle_core::Tensor;
use candle_nn::{conv2d, optim::AdamW, Conv2d, Conv2dConfig, Linear, Module, VarBuilder};

struct Model {
    conv_layer1: Conv2d,
    conv_layer2: Conv2d,
    conv_layer3: Conv2d,
    fc_layer1: Linear,
    fc_layer2: Linear,
}

impl Model {
    pub fn new(vb: VarBuilder) -> candle_core::Result<Self> {
        let conv_layer1 = conv2d(1, 32, 3, Conv2dConfig::default(), vb.clone()).expect("conv2d");
        let conv_layer2 = conv2d(32, 64, 3, Conv2dConfig::default(), vb.clone()).expect("conv2d");
        let conv_layer3 = conv2d(64, 128, 3, Conv2dConfig::default(), vb.clone()).expect("conv2d");

        let fc_layer1_weight = vb.get((256, 128 * 3 * 3), "fc1_weight").expect("get");
        let fc_layer1_bias = vb.get(256, "fc1_bias").expect("get");
        let fc_layer1 = Linear::new(fc_layer1_weight, Some(fc_layer1_bias));

        let fc_layer2_weight = vb.get((256, 10), "fc2_weight").expect("get");
        let fc_layer2_bias = vb.get(10, "fc2_bias").expect("get");
        let fc_layer2 = Linear::new(fc_layer2_weight, Some(fc_layer2_bias));

        Ok(Self {
            conv_layer1,
            conv_layer2,
            conv_layer3,
            fc_layer1,
            fc_layer2,
        })
    }
}

impl Module for Model {
    fn forward(&self, xs: &Tensor) -> candle_core::Result<Tensor> {
        let xs = self
            .conv_layer1
            .forward(xs)
            .expect("forward")
            .relu()
            .expect("relu")
            .max_pool2d(2)
            .expect("max_pool2d");
        let xs = self
            .conv_layer2
            .forward(&xs)
            .expect("forward")
            .relu()
            .expect("relu")
            .max_pool2d(2)
            .expect("max_pool2d");
        let xs = self
            .conv_layer3
            .forward(&xs)
            .expect("forward")
            .relu()
            .expect("relu")
            .max_pool2d(2)
            .expect("max_pool2d");
        let xs = xs.flatten_from(1).expect("flatten_from");
        let xs = self
            .fc_layer1
            .forward(&xs)
            .expect("forward")
            .relu()
            .expect("relu");
        self.fc_layer2.forward(&xs)
    }
}
