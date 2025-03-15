const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const {userOneId,userOne,setupDatabase}=require('./fixtures/db')
beforeEach(setupDatabase);
test("should singup a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "satish",
      email: "satish@gmail.com",
      password: "satish@123",
    })
    .expect(201);
  //Assert that database was changed correctly.
  const user = await User.findById({ _id: response.body.user._id });
  expect(user).not.toBeNull();
  //Assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: "satish",
      email: "satish@gmail.com",
    },
    token: user.tokens[0].token,
  });
  //Assertion to check password not save in test formate
  expect(user.password).not.toBe("satish@123");
});
test("should login existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);
  //Assertion to check token saved to database
  const user = await User.findById(userOneId);
  expect(user.tokens[1].token).toBe(response.body.token);
});
test("should login failed", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: `1${userOne.email}`,
      password: userOne.password,
    })
    .expect(400);
});
test("should get user profile", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});
test("should not get user profile for unathenticated user", async () => {
  await request(app).get("/users/me").send().expect(401);
});
test("should delete user", async () => {
  const response = await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  //Assertion to check user remove from database
  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});
test("should not delete unautheticated user", async () => {
  await request(app).delete("/users/me").send().expect(401);
});
test("should upload avatar image", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "./tests/fixtures/profile-pic.jpg")
    .expect(200);
  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});
test("should update valid user", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: "Roshani",
    })
    .expect(202);

  const user = await User.findById(userOneId);
  expect(user.name).toBe("Roshani");
});

test("should update valid user", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: "Bangalore",
    })
    .expect(400);
});
