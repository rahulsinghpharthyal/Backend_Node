import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    console.log(file);
    cb(null, uniqueSuffix + "-" + file.originalname  );
  },
});

const upload = multer({ storage: storage });

export default upload;
