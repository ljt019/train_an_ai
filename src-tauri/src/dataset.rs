use mnist::{Mnist, MnistBuilder};
use std::error::Error;

struct Dataset {
    train_images: Vec<Vec<f32>>,
    train_labels: Vec<u8>,
    test_images: Vec<Vec<f32>>,
    test_labels: Vec<u8>,
}

impl Dataset {
    fn load_mnist() -> Result<Self, Box<dyn Error>> {
        let mnist = MnistBuilder::new()
            .label_format_digit()
            .training_set_length(60_000)
            .validation_set_length(0)
            .test_set_length(10_000)
            .finalize();

        let train_images = mnist
            .trn_img
            .chunks(28 * 28)
            .map(|chunk| chunk.iter().map(|&x| x as f32 / 255.0).collect())
            .collect();

        let train_labels = mnist.trn_lbl.clone();

        let test_images = mnist
            .tst_img
            .chunks(28 * 28)
            .map(|chunk| chunk.iter().map(|&x| x as f32 / 255.0).collect())
            .collect();

        let test_labels = mnist.tst_lbl.clone();

        Ok(Self {
            train_images,
            train_labels,
            test_images,
            test_labels,
        })
    }

    fn get_batches(
        &self,
        batch_size: usize,
    ) -> impl Iterator<Item = (Vec<Vec<f32>>, Vec<u8>)> + '_ {
        self.train_images
            .chunks(batch_size)
            .zip(self.train_labels.chunks(batch_size))
            .map(|(images, labels)| (images.to_vec(), labels.to_vec()))
    }
}
