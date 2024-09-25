use candle_core::Tensor;
use candle_nn::{conv2d, Conv2d, Conv2dConfig, Linear, Module, VarBuilder};

/// Define the CNN Model
struct Model {
    conv_layer1: Conv2d,
    conv_layer2: Conv2d,
    conv_layer3: Conv2d,
    fc_layer1: Linear,
    fc_layer2: Linear,
}

impl Model {
    pub fn new(vb: VarBuilder) -> candle_core::Result<Self> {
        let conv_layer1 = conv2d(1, 32, 3, Conv2dConfig::default(), vb.clone())?;
        let conv_layer2 = conv2d(32, 64, 3, Conv2dConfig::default(), vb.clone())?;
        let conv_layer3 = conv2d(64, 128, 3, Conv2dConfig::default(), vb.clone())?;

        let fc_layer1_weight = vb.get((128 * 3 * 3, 256), "fc1_weight")?; // Changed shape to match the flattened features
        let fc_layer1_bias = vb.get(256, "fc1_bias")?;
        let fc_layer1 = Linear::new(fc_layer1_weight, Some(fc_layer1_bias));

        let fc_layer2_weight = vb.get((256, 10), "fc2_weight")?;
        let fc_layer2_bias = vb.get(10, "fc2_bias")?;
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
        let xs = self.conv_layer1.forward(xs)?.relu()?.max_pool2d(2)?;
        let xs = self.conv_layer2.forward(&xs)?.relu()?.max_pool2d(2)?;
        let xs = self.conv_layer3.forward(&xs)?.relu()?.max_pool2d(2)?;
        let xs = xs.flatten_from(1)?;
        let xs = self.fc_layer1.forward(&xs)?.relu()?;
        self.fc_layer2.forward(&xs)
    }
}
