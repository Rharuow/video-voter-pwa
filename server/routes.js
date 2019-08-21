let data = [
    {
        id: 1,
        title: "Selena Gomez - Wolves",
        link: "https://www.youtube.com/watch?v=cH4E_t3m3xM",
        points: 0
    },
    {
        id: 2,
        title: "Lukas Graham - Mama Said",
        link: "https://www.youtube.com/watch?v=HdAkYCyCZv8",
        points: 0
    },
    {
        id: 3,
        title: "Alex Clare - Too Close",
        link: "https://www.youtube.com/watch?v=zP50Ewh31E4",
        points: 0
    }
];

let idIndex = 4;

const appRouter = (app) => {
    app.get("/videos", (req, res) => {
        res.status(200).send(JSON.stringify(sortVideos()));
    });

    app.post("/videos", (req, res) => {
        data.push({
            id: req.body.id,
            title: req.body.title,
            link: req.body.link,
            points: 0
        });

        res.status(200).send(JSON.stringify(sortVideos()));
    });

    app.post("/videos/:id/up", (req, res) => {
        const video = findById(req.params.id);

        if (video) {
            video.points++;

            res.status(200).send(JSON.stringify(sortVideos()));
        } else {
            res.status(404).send(JSON.stringify({
                message: "No video found with id: " + req.params.id
            }));
        }
    });

    app.post("/videos/:id/down", (req, res) => {
        const video = findById(req.params.id);

        if (video) {
            video.points--;

            res.status(200).send(JSON.stringify(sortVideos()));
        } else {
            res.status(404).send(JSON.stringify({
                message: "No video found with id: " + req.params.id
            }));
        }
    });
};

const findById = (id) => {
    const idNumber = parseInt(id);
    return data.find((video) => video.id === idNumber);
};

const sortVideos = () => {
  return data.sort((a, b) => {
      if (a.points > b.points) {
          return -1;
      }

      if (a.points < b.points) {
          return 1;
      }

      return 0;
  })
};
module.exports = appRouter;