import type { LangId } from "./types";

export const SUPPLEMENTAL_SNIPPETS: Record<
  string,
  Partial<Record<LangId, string>>
> = {
  "pattern-matching": {
    rust: `enum Shape {
    Circle(f64),
    Rect { width: f64, height: f64 },
    Triangle(f64, f64),
}

fn area(shape: &Shape) -> f64 {
    match shape {
        Shape::Circle(radius) => std::f64::consts::PI * radius * radius,
        Shape::Rect { width, height } => width * height,
        Shape::Triangle(base, height) => 0.5 * base * height,
    }
}`,
    ruby: `Circle = Data.define(:radius)
Rect = Data.define(:width, :height)
Triangle = Data.define(:base, :height)

def area(shape)
  case shape
  in Circle(radius:)
    Math::PI * radius**2
  in Rect(width:, height:)
    width * height
  in Triangle(base:, height:)
    0.5 * base * height
  end
end`,
    julia: `abstract type Shape end
struct Circle <: Shape; radius::Float64; end
struct Rect <: Shape; width::Float64; height::Float64; end
struct Triangle <: Shape; base::Float64; height::Float64; end

area(shape::Circle) = π * shape.radius^2
area(shape::Rect) = shape.width * shape.height
area(shape::Triangle) = 0.5 * shape.base * shape.height`,
    r: `area <- function(shape) {
  switch(
    shape$type,
    circle = pi * shape$radius^2,
    rect = shape$width * shape$height,
    triangle = 0.5 * shape$base * shape$height,
    stop("unknown shape")
  )
}

area(list(type = "circle", radius = 5))`,
    java: `sealed interface Shape permits Circle, Rect, Triangle {}
record Circle(double radius) implements Shape {}
record Rect(double width, double height) implements Shape {}
record Triangle(double base, double height) implements Shape {}

static double area(Shape shape) {
  return switch (shape) {
    case Circle(double radius) -> Math.PI * radius * radius;
    case Rect(double width, double height) -> width * height;
    case Triangle(double base, double height) -> 0.5 * base * height;
  };
}`,
    racket: `#lang racket
(struct circle (radius) #:transparent)
(struct rect (width height) #:transparent)
(struct triangle (base height) #:transparent)

(define (area shape)
  (match shape
    [(circle radius) (* pi radius radius)]
    [(rect width height) (* width height)]
    [(triangle base height) (* 0.5 base height)]))`,
    scala: `enum Shape:
  case Circle(radius: Double)
  case Rect(width: Double, height: Double)
  case Triangle(base: Double, height: Double)

def area(shape: Shape): Double =
  shape match
    case Shape.Circle(radius) => math.Pi * radius * radius
    case Shape.Rect(width, height) => width * height
    case Shape.Triangle(base, height) => 0.5 * base * height`,
    shell: `shape="circle:5"

case "$shape" in
  circle:*)
    radius="\${shape#circle:}"
    awk "BEGIN { print 3.14159 * $radius * $radius }"
    ;;
  rect:*)
    IFS=: read -r _ width height <<EOF
$shape
EOF
    awk "BEGIN { print $width * $height }"
    ;;
esac`,
    cpp: `using Shape = std::variant<Circle, Rect, Triangle>;

auto area(const Shape& shape) -> double {
  return std::visit(
      overloaded{
          [](const Circle& c) { return std::numbers::pi * c.radius * c.radius; },
          [](const Rect& r) { return r.width * r.height; },
          [](const Triangle& t) { return 0.5 * t.base * t.height; },
      },
      shape);
}`,
    perl: `sub area ($shape) {
  my $type = $shape->{type};
  return 3.14159 * $shape->{radius} ** 2 if $type eq "circle";
  return $shape->{width} * $shape->{height} if $type eq "rect";
  return 0.5 * $shape->{base} * $shape->{height} if $type eq "triangle";
  die "unknown shape";
}`,
    javascript: `function area(shape) {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rect":
      return shape.width * shape.height;
    case "triangle":
      return 0.5 * shape.base * shape.height;
  }
}`,
    php: `function area(array $shape): float
{
    return match ($shape['type']) {
        'circle' => pi() * $shape['radius'] ** 2,
        'rect' => $shape['width'] * $shape['height'],
        'triangle' => 0.5 * $shape['base'] * $shape['height'],
    };
}`,
    zig: `const Shape = union(enum) {
    circle: f64,
    rect: struct { width: f64, height: f64 },
    triangle: struct { base: f64, height: f64 },
};

fn area(shape: Shape) f64 {
    return switch (shape) {
        .circle => |radius| std.math.pi * radius * radius,
        .rect => |rect| rect.width * rect.height,
        .triangle => |triangle| 0.5 * triangle.base * triangle.height,
    };
}`,
    lean: `inductive Shape where
  | circle (radius : Float)
  | rect (width height : Float)
  | triangle (base height : Float)

def area : Shape -> Float
  | .circle radius => Float.pi * radius * radius
  | .rect width height => width * height
  | .triangle base height => 0.5 * base * height`,
    idris: `data Shape
  = Circle Double
  | Rect Double Double
  | Triangle Double Double

area : Shape -> Double
area (Circle radius) = pi * radius * radius
area (Rect width height) = width * height
area (Triangle base height) = 0.5 * base * height`,
    bean: `type Shape
  = Circle(Float)
  | Rect(Float, Float)
  | Triangle(Float, Float)

fn area(shape: Shape) -> Float =
  match shape {
    Circle(radius) => pi * radius * radius,
    Rect(width, height) => width * height,
    Triangle(base, height) => 0.5 * base * height,
  }`,
    mojo: `struct Circle:
    var radius: Float64

struct Rect:
    var width: Float64
    var height: Float64

fn area(shape: Circle) -> Float64:
    return 3.141592653589793 * shape.radius * shape.radius`,
    c: `typedef enum { SHAPE_CIRCLE, SHAPE_RECT, SHAPE_TRIANGLE } ShapeTag;

double area(const Shape* shape) {
  switch (shape->tag) {
    case SHAPE_CIRCLE: return M_PI * shape->as.circle.radius * shape->as.circle.radius;
    case SHAPE_RECT: return shape->as.rect.width * shape->as.rect.height;
    case SHAPE_TRIANGLE: return 0.5 * shape->as.triangle.base * shape->as.triangle.height;
  }
  return 0.0;
}`,
    d: `import std.sumtype : SumType, match;

alias Shape = SumType!(Circle, Rect, Triangle);

double area(Shape shape) {
  return shape.match!(
    (Circle c) => PI * c.radius * c.radius,
    (Rect r) => r.width * r.height,
    (Triangle t) => 0.5 * t.base * t.height,
  );
}`,
    moonbit: `enum Shape {
  Circle(Double)
  Rect(Double, Double)
  Triangle(Double, Double)
}

fn area(shape : Shape) -> Double {
  match shape {
    Circle(radius) => 3.141592653589793 * radius * radius
    Rect(width, height) => width * height
    Triangle(base, height) => 0.5 * base * height
  }
}`,
    fsharp: `type Shape =
  | Circle of float
  | Rect of float * float
  | Triangle of float * float

let area shape =
  match shape with
  | Circle radius -> System.Math.PI * radius * radius
  | Rect (width, height) -> width * height
  | Triangle (base', height) -> 0.5 * base' * height`,
    clojure: `(require '[clojure.core.match :refer [match]])

(defn area [shape]
  (match [(:type shape) shape]
    [:circle {:radius r}] (* Math/PI r r)
    [:rect {:width w :height h}] (* w h)
    [:triangle {:base b :height h}] (* 0.5 b h)))`,
    erlang: `area({circle, Radius}) ->
    math:pi() * Radius * Radius;
area({rect, Width, Height}) ->
    Width * Height;
area({triangle, Base, Height}) ->
    0.5 * Base * Height.`,
    gleam: `pub type Shape {
  Circle(Float)
  Rect(Float, Float)
  Triangle(Float, Float)
}

pub fn area(shape: Shape) -> Float {
  case shape {
    Circle(radius) -> 3.141592653589793 *. radius *. radius
    Rect(width, height) -> width *. height
    Triangle(base, height) -> 0.5 *. base *. height
  }
}`,
    haskell: `data Shape
  = Circle Double
  | Rect Double Double
  | Triangle Double Double

area :: Shape -> Double
area (Circle radius) = pi * radius * radius
area (Rect width height) = width * height
area (Triangle base height) = 0.5 * base * height`,
    lisp: `(ql:quickload :trivia)

(defun area (shape)
  (trivia:match shape
    ((list :circle radius) (* pi radius radius))
    ((list :rect width height) (* width height))
    ((list :triangle base height) (* 0.5 base height))))`,
    lua: `local function area(shape)
  if shape.kind == "circle" then
    return math.pi * shape.radius ^ 2
  elseif shape.kind == "rect" then
    return shape.width * shape.height
  elseif shape.kind == "triangle" then
    return 0.5 * shape.base * shape.height
  end
end`,
    prose: `shape is a circle with radius 5

to compute area of shape:
  when shape is circle(radius), return pi * radius * radius
  when shape is rect(width, height), return width * height
  when shape is triangle(base, height), return 0.5 * base * height`,
    agda: `data Shape : Set where
  circle : Float -> Shape
  rect : Float -> Float -> Shape
  triangle : Float -> Float -> Shape

area : Shape -> Float
area (circle radius) = pi * radius * radius
area (rect width height) = width * height
area (triangle base height) = 0.5 * base * height`,
    coq: `Inductive Shape :=
| Circle : R -> Shape
| Rect : R -> R -> Shape
| Triangle : R -> R -> Shape.

Definition area (shape : Shape) : R :=
  match shape with
  | Circle radius => PI * radius * radius
  | Rect width height => width * height
  | Triangle base height => /2 * base * height
  end.`,
    dream: `type Shape =
  | Circle(Float)
  | Rect(Float, Float)
  | Triangle(Float, Float)

fn area(shape : Shape) -> Float =
  match shape
    Circle(radius) => 3.141592653589793 * radius * radius
    Rect(width, height) => width * height
    Triangle(base, height) => 0.5 * base * height`,
  },
  "result-types": {
    rust: `#[derive(Debug)]
enum UpdateEmailError {
    NotFound(u64),
    InvalidEmail,
}

fn update_email(user_id: u64, new_email: &str) -> Result<User, UpdateEmailError> {
    let user = repo::find(user_id).ok_or(UpdateEmailError::NotFound(user_id))?;
    validator::email(new_email).then_some(()).ok_or(UpdateEmailError::InvalidEmail)?;
    repo::save(user.with_email(new_email))
}`,
    ruby: `require "dry/monads"
require "dry/monads/do"

class Users
  include Dry::Monads[:result]
  include Dry::Monads::Do.for(:update_email)

  def update_email(user_id, new_email)
    user = yield fetch_user(user_id)
    yield validate_email(new_email)
    persist_email(user, new_email)
  end
end`,
    julia: `using ResultTypes

function fetch_user(id)::Result{User,Symbol}
    user = repo_get(id)
    isnothing(user) ? ErrorResult(:not_found) : Result(user)
end

function update_email(id, new_email)::Result{User,Symbol}
    user = unwrap(fetch_user(id))
    is_valid_email(new_email) || return ErrorResult(:invalid_email)
    Result(save(user; email=new_email))
end`,
    r: `ok <- function(value) list(ok = TRUE, value = value)
err <- function(message) list(ok = FALSE, error = message)

update_email <- function(user_id, new_email) {
  user <- repo_get(user_id)
  if (is.null(user)) return(err("not_found"))
  if (!grepl("@", new_email)) return(err("invalid_email"))
  ok(repo_save(modifyList(user, list(email = new_email))))
}`,
    java: `sealed interface Result<T, E> permits Ok, Err {}
record Ok<T, E>(T value) implements Result<T, E> {}
record Err<T, E>(E error) implements Result<T, E> {}

Result<User, UpdateEmailError> updateEmail(long userId, String newEmail) {
  return switch (repo.find(userId)) {
    case Optional<User> user when user.isPresent() && Email.isValid(newEmail) ->
        new Ok<>(repo.save(user.get().withEmail(newEmail)));
    case Optional<User> ignored when !Email.isValid(newEmail) ->
        new Err<>(UpdateEmailError.INVALID_EMAIL);
    default -> new Err<>(UpdateEmailError.notFound(userId));
  };
}`,
    racket: `#lang racket
(struct ok (value) #:transparent)
(struct err (reason) #:transparent)

(define (update-email user-id new-email)
  (match (hash-ref users user-id #f)
    [#f (err 'not-found)]
    [user
     (if (regexp-match? #rx"@" new-email)
         (ok (hash-set user 'email new-email))
         (err 'invalid-email))]))`,
    scala: `enum UpdateEmailError:
  case NotFound(id: Long)
  case InvalidEmail

def updateEmail(userId: Long, newEmail: String): Either[UpdateEmailError, User] =
  for
    user <- repo.find(userId).toRight(UpdateEmailError.NotFound(userId))
    _ <- Either.cond(newEmail.contains("@"), (), UpdateEmailError.InvalidEmail)
  yield repo.save(user.copy(email = newEmail))`,
    shell: `update_email() {
  local user_id="$1"
  local new_email="$2"

  [[ "$new_email" == *"@"* ]] || { echo "error:invalid_email"; return 1; }
  repo_get "$user_id" >/tmp/user.json || { echo "error:not_found"; return 1; }
  repo_save "$user_id" "$new_email" && echo "ok:$user_id"
}`,
    cpp: `using UpdateResult = std::expected<User, UpdateEmailError>;

auto update_email(UserId user_id, std::string_view new_email) -> UpdateResult {
  auto user = repo::find(user_id);
  if (!user) return std::unexpected(UpdateEmailError::not_found(user_id));
  if (!email::is_valid(new_email)) return std::unexpected(UpdateEmailError::invalid_email());

  return repo::save(user->with_email(new_email));
}`,
    perl: `sub ok ($value) { return { ok => 1, value => $value } }
sub err ($reason) { return { ok => 0, error => $reason } }

sub update_email ($user_id, $new_email) {
  my $user = repo_get($user_id) or return err("not_found");
  return err("invalid_email") unless $new_email =~ /@/;
  return ok(repo_save({ %$user, email => $new_email }));
}`,
    javascript: `import { err, ok } from "neverthrow";

function updateEmail(userId, newEmail) {
  if (!newEmail.includes("@")) return err({ type: "invalid_email" });
  return fetchUser(userId)
    .andThen((user) => persistEmail(user, newEmail))
    .mapErr((error) => ({ type: error.type, userId }));
}`,
    php: `function updateEmail(int $userId, string $newEmail): Result
{
    $user = $this->repo->find($userId);

    return match (true) {
        $user === null => Result::err(UpdateEmailError::notFound($userId)),
        !filter_var($newEmail, FILTER_VALIDATE_EMAIL) => Result::err(UpdateEmailError::invalidEmail()),
        default => Result::ok($this->repo->save($user->withEmail($newEmail))),
    };
}`,
    zig: `const UpdateEmailError = error{
    NotFound,
    InvalidEmail,
};

fn updateEmail(repo: *Repo, user_id: u64, new_email: []const u8) UpdateEmailError!User {
    if (!isValidEmail(new_email)) return error.InvalidEmail;

    var user = try repo.find(user_id) orelse return error.NotFound;
    user.email = new_email;
    return try repo.save(user);
}`,
    lean: `inductive UpdateEmailError where
  | notFound (userId : Nat)
  | invalidEmail

def updateEmail (repo : Repo) (userId : Nat) (newEmail : String) :
    Except UpdateEmailError User := do
  let user ← repo.find userId |>.toExcept (UpdateEmailError.notFound userId)
  if !newEmail.contains '@' then
    throw .invalidEmail
  repo.save { user with email := newEmail }`,
    idris: `data UpdateEmailError
  = NotFound Nat
  | InvalidEmail

updateEmail : Nat -> String -> Either UpdateEmailError User
updateEmail userId newEmail = do
  user <- maybeToEither (NotFound userId) (repoGet userId)
  if contains "@" newEmail
    then Right (repoSave (record { email = newEmail } user))
    else Left InvalidEmail`,
    bean: `type UpdateEmailError
  = NotFound(Int)
  | InvalidEmail

fn update_email(user_id: Int, new_email: String) -> Result<User, UpdateEmailError> =
  match repo.get(user_id) {
    None => Err(NotFound(user_id)),
    Some(user) if not new_email.contains("@") => Err(InvalidEmail),
    Some(user) => Ok(repo.save(user { email = new_email })),
  }`,
    mojo: `struct UpdateEmailError:
    var message: String

fn update_email(user_id: Int, new_email: String) -> Result[User, UpdateEmailError]:
    if "@" not in new_email:
        return Result.err(UpdateEmailError("invalid_email"))

    let user = repo_find(user_id)
    if not user:
        return Result.err(UpdateEmailError("not_found"))

    return Result.ok(repo_save(user.value().with_email(new_email)))`,
    c: `typedef struct {
  bool ok;
  union {
    User value;
    UpdateEmailError error;
  } as;
} UpdateEmailResult;

UpdateEmailResult update_email(Repo *repo, int user_id, const char *new_email);`,
    d: `import std.typecons : Result;

Result!(User, UpdateEmailError) updateEmail(long userId, string newEmail) {
  auto user = repo.find(userId);
  if (user.isNull) return typeof(return)(UpdateEmailError.notFound(userId));
  if (!newEmail.canFind("@")) return typeof(return)(UpdateEmailError.invalidEmail());
  return typeof(return)(repo.save(user.withEmail(newEmail)));
}`,
    moonbit: `enum UpdateEmailError {
  NotFound(Int)
  InvalidEmail
}

fn update_email(user_id : Int, new_email : String) -> Result[User, UpdateEmailError] {
  guard new_email.contains("@") else { Err(InvalidEmail) }
  match repo_get(user_id) {
    None => Err(NotFound(user_id))
    Some(user) => Ok(repo_save({ ..user, email: new_email }))
  }
}`,
    fsharp: `type UpdateEmailError =
  | NotFound of int64
  | InvalidEmail

let updateEmail userId newEmail =
  result {
    let! user = repoFind userId |> Result.ofOption (NotFound userId)
    do! if newEmail.Contains("@") then Ok () else Error InvalidEmail
    return repoSave { user with Email = newEmail }
  }`,
    clojure: `(defn update-email [user-id new-email]
  (cond
    (nil? (repo-get user-id)) {:error [:not-found user-id]}
    (not (re-find #"@" new-email)) {:error [:invalid-email]}
    :else {:ok (repo-save (assoc (repo-get user-id) :email new-email))}))`,
    erlang: `update_email(UserId, NewEmail) ->
    case {repo:get(UserId), string:find(NewEmail, "@")} of
        {error, _} ->
            {error, {not_found, UserId}};
        {_, nomatch} ->
            {error, invalid_email};
        {{ok, User}, _} ->
            {ok, repo:save(User#{email => NewEmail})}
    end.`,
    gleam: `pub type UpdateEmailError {
  NotFound(Int)
  InvalidEmail
}

pub fn update_email(user_id: Int, new_email: String) -> Result(User, UpdateEmailError) {
  use user <- result.try(repo_get(user_id))
  if string.contains(new_email, "@") {
    Ok(repo_save(User(..user, email: new_email)))
  } else {
    Error(InvalidEmail)
  }
}`,
    haskell: `data UpdateEmailError
  = NotFound UserId
  | InvalidEmail

updateEmail :: UserId -> Text -> Either UpdateEmailError User
updateEmail userId newEmail = do
  user <- maybe (Left (NotFound userId)) Right (repoFind userId)
  unless ("@" \`Text.isInfixOf\` newEmail) (Left InvalidEmail)
  Right (repoSave user { email = newEmail })`,
    lisp: `(defun update-email (user-id new-email)
  (cond
    ((null (repo-get user-id)) '(:error :not-found))
    ((not (search "@" new-email)) '(:error :invalid-email))
    (t (list :ok (repo-save user-id :email new-email)))))`,
    lua: `local function update_email(user_id, new_email)
  local user = repo_get(user_id)
  if not user then
    return nil, "not_found"
  end
  if not new_email:find("@", 1, true) then
    return nil, "invalid_email"
  end
  user.email = new_email
  return repo_save(user), nil
end`,
    prose: `to update email for user user_id with new_email:
  when user user_id does not exist, return error "not_found"
  when new_email is not a valid email, return error "invalid_email"
  otherwise return ok repo.save(user with email = new_email)`,
    agda: `data UpdateEmailError : Set where
  notFound : Nat -> UpdateEmailError
  invalidEmail : UpdateEmailError

updateEmail : Nat -> String -> Either UpdateEmailError User
updateEmail userId newEmail with repoGet userId
... | nothing = left (notFound userId)
... | just user = if contains "@" newEmail
  then right (repoSave (setEmail newEmail user))
  else left invalidEmail`,
    coq: `Inductive update_email_error :=
| NotFound : nat -> update_email_error
| InvalidEmail : update_email_error.

Definition update_email (user_id : nat) (new_email : string)
  : result User update_email_error := (* explicit success/error contract *)`,
    dream: `type UpdateEmailError =
  | NotFound(Int)
  | InvalidEmail

fn update_email(user_id : Int, new_email : String)
  -> Result<User, UpdateEmailError>
= {
  let user = repo.get(user_id).to_result(NotFound(user_id))?
  if not new_email.contains("@") then
    Err(InvalidEmail)
  else
    Ok(repo.save(user { email = new_email }))
}`,
  },
  "formatter-uniformity": {
    rust: `// Canonical formatter: rustfmt
#[derive(Debug, Clone)]
struct UserRecord {
    name: String,
    email: String,
    role: &'static str,
}

fn build_user(name: &str, email: &str, is_admin: bool) -> UserRecord {
    UserRecord {
        name: name.trim().to_owned(),
        email: email.trim().to_lowercase(),
        role: if is_admin { "staff" } else { "member" },
    }
}`,
    ruby: `# Canonical formatter: syntax_tree
def build_user(name, email, admin:)
  {
    name: name.strip,
    email: email.strip.downcase,
    admin: admin,
    tags: ["active", (admin ? "staff" : "member")],
  }
end`,
    julia: `# Opinionated formatter: JuliaFormatter.jl
function build_user(name::String, email::String, admin::Bool)
    (
        name = strip(name),
        email = lowercase(strip(email)),
        admin = admin,
        tags = ["active", admin ? "staff" : "member"],
    )
end`,
    r: `# Opinionated formatter: styler
build_user <- function(name, email, admin) {
  list(
    name = trimws(name),
    email = tolower(trimws(email)),
    admin = admin,
    tags = c("active", if (admin) "staff" else "member")
  )
}`,
    java: `// Opinionated formatter: google-java-format
record UserRecord(String name, String email, boolean admin, List<String> tags) {}

static UserRecord buildUser(String name, String email, boolean admin) {
  return new UserRecord(
      name.trim(),
      email.trim().toLowerCase(Locale.ROOT),
      admin,
      List.of("active", admin ? "staff" : "member"));
}`,
    racket: `#lang racket
;; Opinionated formatter: fmt / standard Racket indentation
(define (build-user name email admin?)
  (hash 'name (string-trim name)
        'email (string-downcase (string-trim email))
        'admin? admin?
        'tags (list "active" (if admin? "staff" "member"))))`,
    scala: `// Opinionated formatter: scalafmt
final case class User(name: String, email: String, admin: Boolean, tags: List[String])

def buildUser(name: String, email: String, admin: Boolean): User =
  User(
    name = name.trim,
    email = email.trim.toLowerCase,
    admin = admin,
    tags = List("active", if admin then "staff" else "member"),
  )`,
    shell: `# Opinionated formatter: shfmt
build_user() {
  local name=$1
  local email=$2
  local is_admin=$3
  local role=member

  if [[ "$is_admin" == "true" ]]; then
    role=staff
  fi

  printf '{"name":"%s","email":"%s","is_admin":%s,"tags":["active","%s"]}\n' \
    "$(printf '%s' "$name" | xargs)" \
    "$(printf '%s' "$email" | xargs | tr '[:upper:]' '[:lower:]')" \
    "$is_admin" \
    "$role"
}`,
    cpp: `// Opinionated formatter: clang-format
struct User {
  std::string name;
  std::string email;
  bool is_admin;
  std::vector<std::string> tags;
};

auto build_user(std::string_view name, std::string_view email, bool is_admin) -> User {
  return User{
      .name = trim(name),
      .email = lowercase(trim(email)),
      .is_admin = is_admin,
      .tags = {"active", is_admin ? "staff" : "member"},
  };
}`,
    perl: `# Opinionated formatter: perltidy
sub build_user ($name, $email, $is_admin) {
  return {
    name     => trim($name),
    email    => lc trim($email),
    is_admin => $is_admin,
    tags     => [ 'active', $is_admin ? 'staff' : 'member' ],
  };
}`,
    javascript: `// Opinionated formatter: Biome or Prettier
export function buildUser(name, email, isAdmin) {
  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    isAdmin,
    tags: ["active", isAdmin ? "staff" : "member"],
  };
}`,
    php: `// Opinionated formatter: Laravel Pint / PHP CS Fixer
function buildUser(string $name, string $email, bool $admin): array
{
    return [
        'name' => trim($name),
        'email' => mb_strtolower(trim($email)),
        'admin' => $admin,
        'tags' => ['active', $admin ? 'staff' : 'member'],
    ];
}`,
    zig: `// Canonical formatter: zig fmt
fn buildUser(allocator: Allocator, name: []const u8, email: []const u8, admin: bool) !User {
    return .{
        .name = try trimAlloc(allocator, name),
        .email = try lowerAlloc(allocator, email),
        .admin = admin,
        .role = if (admin) .staff else .member,
    };
}`,
    lean: `-- Opinionated formatter: lake fmt / canonical pretty-printing
structure User where
  name : String
  email : String
  isAdmin : Bool
  tags : List String

def buildUser (name email : String) (isAdmin : Bool) : User :=
  { name := name.trim
    email := email.trim.toLower
    isAdmin := isAdmin
    tags := ["active", if isAdmin then "staff" else "member"] }`,
    idris: `-- Opinionated formatter: idris2 --pretty
record User where
  constructor MkUser
  name : String
  email : String
  isAdmin : Bool
  tags : List String

buildUser : String -> String -> Bool -> User
buildUser name email isAdmin =
  MkUser
    (trim name)
    (toLower (trim email))
    isAdmin
    ["active", if isAdmin then "staff" else "member"]`,
    bean: `// Canonical formatter: bean fmt
fn build_user(name: String, email: String, admin: Bool) -> User {
  User {
    name: name.trim(),
    email: email.trim().lowercase(),
    admin: admin,
    tags: ["active", if admin { "staff" } else { "member" }],
  }
}`,
    mojo: `# Opinionated formatter: mojo format
struct User:
    var name: String
    var email: String
    var is_admin: Bool
    var tags: List[String]

fn build_user(name: String, email: String, is_admin: Bool) -> User:
    return User(
        name=name.strip(),
        email=email.strip().lower(),
        is_admin=is_admin,
        tags=["active", "staff" if is_admin else "member"],
    )`,
    c: `/* Opinionated formatter: clang-format */
typedef struct {
  char name[64];
  char email[64];
  bool is_admin;
  const char *tags[2];
} User;

User build_user(const char *name, const char *email, bool is_admin) {
  return (User){
    .name = trim_copy(name),
    .email = lowercase_copy(trim_copy(email)),
    .is_admin = is_admin,
    .tags = {"active", is_admin ? "staff" : "member"},
  };
}`,
    d: `// Opinionated formatter: dfmt
struct User {
  string name;
  string email;
  bool isAdmin;
  string[] tags;
}

User buildUser(string name, string email, bool isAdmin) {
  return User(
    name.strip,
    email.strip.toLower,
    isAdmin,
    ["active", isAdmin ? "staff" : "member"],
  );
}`,
    moonbit: `// Canonical formatter: moon fmt
fn build_user(name : String, email : String, admin : Bool) -> User {
  {
    name: name.trim(),
    email: email.trim().lowercase(),
    admin: admin,
    tags: ["active", if admin { "staff" } else { "member" }],
  }
}`,
    fsharp: `// Opinionated formatter: fantomas
type User = {
  Name: string
  Email: string
  IsAdmin: bool
  Tags: string list
}

let buildUser name email isAdmin =
  {
    Name = name.Trim()
    Email = email.Trim().ToLowerInvariant()
    IsAdmin = isAdmin
    Tags = [ "active"; if isAdmin then "staff" else "member" ]
  }`,
    clojure: `;; Opinionated formatter: zprint
(defn build-user [name email is-admin]
  {:name (clojure.string/trim name)
   :email (-> email clojure.string/trim clojure.string/lower-case)
   :is-admin is-admin
   :tags ["active" (if is-admin "staff" "member")]})`,
    erlang: `%% Opinionated formatter: erlfmt
build_user(Name, Email, IsAdmin) ->
    #{name => string:trim(Name),
      email => string:lowercase(string:trim(Email)),
      is_admin => IsAdmin,
      tags => ["active", case IsAdmin of true -> "staff"; false -> "member" end]}.`,
    gleam: `// Canonical formatter: gleam format
pub fn build_user(name: String, email: String, admin: Bool) -> User {
  User(
    name: string.trim(name),
    email: string.lowercase(string.trim(email)),
    admin: admin,
    tags: ["active", if admin { "staff" } else { "member" }],
  )
}`,
    haskell: `-- Opinionated formatter: ormolu
data User = User
  { name :: String
  , email :: String
  , isAdmin :: Bool
  , tags :: [String]
  }

buildUser :: String -> String -> Bool -> User
buildUser name email isAdmin =
  User
    { name = trim name
    , email = lowercase (trim email)
    , isAdmin = isAdmin
    , tags = ["active", if isAdmin then "staff" else "member"]
    }`,
    lisp: `;;; Opinionated formatter: Lisp Pretty Printer
(defstruct user name email admin tags)

(defun build-user (name email admin)
  (make-user
   :name (string-trim '(#\Space) name)
   :email (string-downcase (string-trim '(#\Space) email))
   :admin admin
   :tags (list "active" (if admin "staff" "member"))))`,
    lua: `-- Opinionated formatter: stylua
local function build_user(name, email, is_admin)
  return {
    name = name:match("^%s*(.-)%s*$"),
    email = email:match("^%s*(.-)%s*$"):lower(),
    is_admin = is_admin,
    tags = { "active", is_admin and "staff" or "member" },
  }
end`,
    prose: `formatter: canonical style

build_user(name, email, is_admin) = {
  name: trim(name),
  email: lowercase(trim(email)),
  is_admin: is_admin,
  tags: ["active", if is_admin then "staff" else "member"],
}`,
    agda: `record User : Set where
  field
    name : String
    email : String
    isAdmin : Bool
    tags : List String

buildUser : String → String → Bool → User
buildUser name email isAdmin =
  record
    { name = trim name
    ; email = toLower (trim email)
    ; isAdmin = isAdmin
    ; tags = "active" ∷ (if isAdmin then "staff" else "member") ∷ []
    }`,
    coq: `Record User := {
  name : string;
  email : string;
  is_admin : bool;
  tags : list string;
}.

Definition build_user (name email : string) (is_admin : bool) : User :=
  {| name := trim name;
     email := lowercase (trim email);
     is_admin := is_admin;
     tags := ["active"; if is_admin then "staff" else "member"] |}.`,
    dream: `// Canonical formatter: dream fmt
fn build_user(name : String, email : String, admin : Bool) -> User = {
  {
    name: name.trim(),
    email: email.trim().lowercase(),
    admin: admin,
    tags: ["active", if admin then "staff" else "member"],
  }
}`,
  },
  "doctests": {
    rust: `/// Safely adds two integers.
///
/// # Examples
///
/// \`\`\`
/// assert_eq!(safe_add(1, 2), Ok(3));
/// assert_eq!(safe_add(9_999_999_999, 1), Err(AddError::Overflow));
/// \`\`\`
fn safe_add(a: i64, b: i64) -> Result<i64, AddError> {
    a.checked_add(b).ok_or(AddError::Overflow)
}`,
    ruby: `# Safely adds two integers.
# @example
#   safe_add(1, 2) # => Success(3)
# @example
#   safe_add(9_999_999_999, 1) # => Failure(:overflow)
# Run with: yard doctest
def safe_add(a, b)
  value = a + b
  value.abs > 9_999_999_999 ? Failure(:overflow) : Success(value)
end`,
    julia: `"""
    safe_add(a, b)

# Examples
julia> safe_add(1, 2)
Ok(3)

julia> safe_add(9_999_999_999, 1)
Err(:overflow)
"""
safe_add(a, b) = checked_add(a, b)`,
    r: `#' Safely adds two integers.
#'
#' @examples
#' safe_add(1, 2)
#' safe_add(9999999999, 1)
safe_add <- function(a, b) {
  result <- a + b
  if (abs(result) > 9999999999) stop("overflow")
  result
}`,
    java: `/**
 * Safely adds two integers.
 *
 * <pre>{@code
 * safeAdd(1, 2);           // Ok(3)
 * safeAdd(9_999_999_999L, 1); // Err(OVERFLOW)
 * }</pre>
 */
static Result<Long, AddError> safeAdd(long a, long b) { ... }`,
    racket: `#lang racket
(require rackunit)

;; Safely adds two integers.
;;
;; Examples:
;; > (safe-add 1 2)
;; '(ok 3)
;; > (safe-add 9999999999 1)
;; '(error overflow)
(define (safe-add a b)
  (define result (+ a b))
  (if (> (abs result) 9999999999)
      '(error overflow)
      (list 'ok result)))

(check-equal? (safe-add 1 2) '(ok 3))`,
    scala: `/** Safely adds two integers.
  *
  * Example:
  * {{
  * safeAdd(1, 2) == Right(3)
  * safeAdd(9999999999L, 1) == Left(Overflow)
  * }}
  */
object Math:
  enum AddError:
    case Overflow

  def safeAdd(a: Long, b: Long): Either[AddError, Long] =
    val result = a + b
    if math.abs(result) > 9999999999L then Left(AddError.Overflow)
    else Right(result)`,
    shell: `safe_add() {
  local a=$1
  local b=$2
  local result=$((a + b))

  if (( result > 9999999999 || result < -9999999999 )); then
    printf 'error:overflow\n'
  else
    printf 'ok:%s\n' "$result"
  fi
}

# Example:
# $ safe_add 1 2
# ok:3
# $ safe_add 9999999999 1
# error:overflow`,
    cpp: `/// Safely adds two integers.
///
/// Example:
///   safe_add(1, 2) -> std::expected<long long, AddError>{3}
///   safe_add(9'999'999'999LL, 1) -> std::unexpected(AddError::overflow)
enum class AddError { overflow };

auto safe_add(long long a, long long b) -> std::expected<long long, AddError> {
  const auto result = a + b;
  if (std::llabs(result) > 9'999'999'999LL) {
    return std::unexpected(AddError::overflow);
  }
  return result;
}`,
    perl: `=pod

=head2 safe_add

  safe_add(1, 2);            # { ok => 1, value => 3 }
  safe_add(9999999999, 1);   # { ok => 0, error => 'overflow' }

=cut
sub safe_add ($a, $b) {
  my $result = $a + $b;
  return { ok => 0, error => 'overflow' } if abs($result) > 9_999_999_999;
  return { ok => 1, value => $result };
}`,
    javascript: `/**
 * Safely adds two integers.
 *
 * @example
 * safeAdd(1, 2) // => ok(3)
 * @example
 * safeAdd(9_999_999_999, 1) // => err("overflow")
 *
 * Run with Vitest examples or tsdoc-generated snippets.
 */`,
    php: `/**
 * Safely adds two integers.
 *
 * @example safeAdd(1, 2); // Result::ok(3)
 * @example safeAdd(9_999_999_999, 1); // Result::err(AddError::Overflow)
 */
function safeAdd(int $a, int $b): Result { ... }`,
    zig: `/// Safely adds two integers.
test "safe_add docs examples" {
    try std.testing.expectEqual(@as(i64, 3), try safeAdd(1, 2));
    try std.testing.expectError(error.Overflow, safeAdd(9_999_999_999, 1));
}

fn safeAdd(a: i64, b: i64) !i64 {
    return std.math.add(i64, a, b);
}`,
    lean: `/-- Safely adds two integers.

Examples:
* \`#eval safeAdd 1 2\` gives \`Except.ok 3\`
* \`#eval safeAdd 9999999999 1\` gives \`Except.error .overflow\`
-/
inductive AddError where
  | overflow

def safeAdd (a b : Int) : Except AddError Int :=
  let result := a + b
  if Int.natAbs result > 9999999999 then
    .error .overflow
  else
    .ok result`,
    idris: `||| Safely adds two integers.
||| 
||| Example:
|||   safeAdd 1 2 = Right 3
|||   safeAdd 9999999999 1 = Left Overflow

data AddError = Overflow

safeAdd : Integer -> Integer -> Either AddError Integer
safeAdd a b =
  let result = a + b in
    if abs result > 9999999999 then Left Overflow else Right result`,
    bean: `/// Safely adds two integers.
///
/// Example:
///   safe_add(1, 2) == Ok(3)
///   safe_add(9_999_999_999, 1) == Err(Overflow)
type AddError = Overflow

fn safe_add(a: Int, b: Int) -> Result<Int, AddError> {
  let result = a + b
  if result.abs() > 9_999_999_999 {
    Err(Overflow)
  } else {
    Ok(result)
  }
}`,
    mojo: `"""Safely adds two integers.

Examples:
    safe_add(1, 2) -> Result.ok(3)
    safe_add(9_999_999_999, 1) -> Result.err("overflow")
"""
fn safe_add(a: Int, b: Int) -> Result[Int, String]:
    let result = a + b
    if abs(result) > 9_999_999_999:
        return Result.err("overflow")
    return Result.ok(result)`,
    c: `/* Safely adds two integers.
 *
 * Example:
 *   safe_add(1, 2) -> { .ok = true, .value = 3 }
 *   safe_add(9999999999, 1) -> { .ok = false, .error = ADD_OVERFLOW }
 */
typedef enum { ADD_OVERFLOW } AddError;
typedef struct {
  bool ok;
  long long value;
  AddError error;
} SafeAddResult;

SafeAddResult safe_add(long long a, long long b);`,
    d: `/// Safely adds two integers.
///
/// Example:
///   assert(safeAdd(1, 2) == Result!(long, AddError)(3));
///   assert(safeAdd(9_999_999_999L, 1) == Result!(long, AddError)(AddError.overflow));
enum AddError { overflow }

Result!(long, AddError) safeAdd(long a, long b) {
  auto result = a + b;
  return abs(result) > 9_999_999_999L
    ? typeof(return)(AddError.overflow)
    : typeof(return)(result);
}`,
    moonbit: `/// Safely adds two integers.
/// 
/// # Examples
/// safe_add(1, 2) == Ok(3)
/// safe_add(9_999_999_999, 1) == Err(Overflow)
fn safe_add(a : Int, b : Int) -> Result[Int, AddError] { ... }`,
    fsharp: `/// Safely adds two integers.
///
/// Example:
///   safeAdd 1L 2L = Ok 3L
///   safeAdd 9999999999L 1L = Error Overflow

type AddError = Overflow

let safeAdd (a: int64) (b: int64) : Result<int64, AddError> =
  let result = a + b
  if abs result > 9_999_999_999L then Error Overflow else Ok result`,
    clojure: `;; Safely adds two integers.
;;
;; Example:
;;   (safe-add 1 2) => [:ok 3]
;;   (safe-add 9999999999 1) => [:error :overflow]
(defn safe-add [a b]
  (let [result (+ a b)]
    (if (> (Math/abs result) 9999999999)
      [:error :overflow]
      [:ok result])))`,
    erlang: `%% Safely adds two integers.
%%
%% Example:
%%   safe_add(1, 2).            %% {ok, 3}
%%   safe_add(9999999999, 1).   %% {error, overflow}
-spec safe_add(integer(), integer()) -> {ok, integer()} | {error, overflow}.
safe_add(A, B) ->
    Result = A + B,
    case abs(Result) > 9999999999 of
        true -> {error, overflow};
        false -> {ok, Result}
    end.`,
    gleam: `/// Safely adds two integers.
///
/// \`\`\`gleam
/// safe_add(1, 2)
/// // -> Ok(3)
/// \`\`\`
pub fn safe_add(a: Int, b: Int) -> Result(Int, AddError) { ... }`,
    haskell: `{-| Safely adds two integers.

Examples:
>>> safeAdd 1 2
Right 3
>>> safeAdd 9999999999 1
Left Overflow
-}
data AddError = Overflow deriving (Eq, Show)

safeAdd :: Integer -> Integer -> Either AddError Integer
safeAdd a b =
  let result = a + b
   in if abs result > 9999999999 then Left Overflow else Right result`,
    lisp: `;;; Safely adds two integers.
;;;
;;; Example:
;;;   (safe-add 1 2) => (:ok 3)
;;;   (safe-add 9999999999 1) => (:error :overflow)
(defun safe-add (a b)
  (let ((result (+ a b)))
    (if (> (abs result) 9999999999)
        '(:error :overflow)
        (list :ok result))))`,
    lua: `--- Safely adds two integers.
---
--- Example:
---   safe_add(1, 2) -> { ok = true, value = 3 }
---   safe_add(9999999999, 1) -> { ok = false, error = "overflow" }
local function safe_add(a, b)
  local result = a + b
  if math.abs(result) > 9999999999 then
    return { ok = false, error = "overflow" }
  end
  return { ok = true, value = result }
end`,
    prose: `safe_add(a, b):
  let result = a + b
  if abs(result) > 9_999_999_999:
    return error overflow
  otherwise:
    return ok result

example:
  safe_add(1, 2) => ok 3
  safe_add(9_999_999_999, 1) => error overflow`,
    agda: `data AddError : Set where
  overflow : AddError

safeAdd : Integer → Integer → AddError ⊎ Integer
safeAdd a b with abs (a + b) >? 9999999999
... | yes _ = inj₁ overflow
... | no _  = inj₂ (a + b)

-- Example: safeAdd 1 2 = inj₂ 3`,
    coq: `Inductive add_error := Overflow.

Definition safe_add (a b : Z) : add_error + Z :=
  let result := a + b in
  if Z.gtb (Z.abs result) 9999999999 then inl Overflow else inr result.

(* Example: safe_add 1 2 = inr 3 *)`,
    dream: `/// Safely adds two integers.
///
/// Example:
///   safe_add(1, 2) == Ok(3)
///   safe_add(9_999_999_999, 1) == Err(Overflow)
fn safe_add(a : Int, b : Int) -> Result<Int, AddError> =
  Int.checked_add(a, b).to_result(Overflow)`,
  },
  "immutability": {
    rust: `#[derive(Debug, Clone)]
struct CounterState {
    count: i32,
    history: Vec<i32>,
}

fn increment(state: &CounterState) -> CounterState {
    let next_count = state.count + 1;
    let mut history = state.history.clone();
    history.push(next_count);

    CounterState {
        count: next_count,
        history,
    }
}`,
    ruby: `CounterState = Data.define(:count, :history)

def increment(state)
  next_count = state.count + 1
  CounterState.new(count: next_count, history: [*state.history, next_count])
end

state = CounterState.new(count: 0, history: [])
next_state = increment(state)

state.count      # => 0
next_state.count # => 1`,
    julia: `Base.@kwdef struct CounterState
    count::Int
    history::Vector{Int} = Int[]
end

function increment(state::CounterState)
    next = state.count + 1
    CounterState(count = next, history = [state.history; next])
end

state = CounterState(count = 0)
next_state = increment(state)`,
    r: `counter_state <- function(count, history = integer()) {
  list(count = count, history = history)
}

increment <- function(state) {
  next_count <- state$count + 1L
  counter_state(
    count = next_count,
    history = c(state$history, next_count)
  )
}

state <- counter_state(0L)
next_state <- increment(state)`,
    java: `record CounterState(int count, java.util.List<Integer> history) {}

static CounterState increment(CounterState state) {
  var next = state.count() + 1;
  var history = new java.util.ArrayList<>(state.history());
  history.add(next);
  return new CounterState(next, java.util.List.copyOf(history));
}

var state = new CounterState(0, java.util.List.of());
var nextState = increment(state);`,
    racket: `#lang racket
(struct counter-state (count history) #:transparent)

(define (increment state)
  (define next (add1 (counter-state-count state)))
  (counter-state next (append (counter-state-history state) (list next))))

(define state (counter-state 0 '()))
(define next-state (increment state))`,
    scala: `final case class CounterState(count: Int, history: Vector[Int] = Vector.empty)

def increment(state: CounterState): CounterState =
  val next = state.count + 1
  state.copy(count = next, history = state.history :+ next)

val state = CounterState(0)
val nextState = increment(state)`,
    shell: `state_count=0
state_history=()

increment() {
  local next=$((state_count + 1))
  printf '%s\n' "$next"
}

next_count=$(increment)
next_history=("\${state_history[@]}" "$next_count")

echo "$state_count"  # 0
echo "$next_count"   # 1`,
    cpp: `struct CounterState {
  int count;
  std::vector<int> history;
};

auto increment(const CounterState& state) -> CounterState {
  const auto next = state.count + 1;
  auto history = state.history;
  history.push_back(next);
  return CounterState{.count = next, .history = std::move(history)};
}`,
    perl: `sub increment ($state) {
  my $next = $state->{count} + 1;
  return {
    count => $next,
    history => [ @{$state->{history}}, $next ],
  };
}

my $state = { count => 0, history => [] };
my $next_state = increment($state);`,
    javascript: `function increment(state) {
  const next = state.count + 1;
  return {
    ...state,
    count: next,
    history: [...state.history, next],
  };
}

const state = { count: 0, history: [] };
const nextState = increment(state);`,
    php: `final readonly class CounterState
{
    public function __construct(
        public int $count,
        public array $history = [],
    ) {}
}

function increment(CounterState $state): CounterState
{
    $next = $state->count + 1;
    return new CounterState($next, [...$state->history, $next]);
}`,
    zig: `const CounterState = struct {
    count: i32,
    history: []const i32,
};

fn increment(allocator: std.mem.Allocator, state: CounterState) !CounterState {
    const next = state.count + 1;
    var history = try allocator.alloc(i32, state.history.len + 1);
    @memcpy(history[0..state.history.len], state.history);
    history[state.history.len] = next;
    return .{ .count = next, .history = history };
}`,
    lean: `structure CounterState where
  count : Nat
  history : List Nat := []

def increment (state : CounterState) : CounterState :=
  let next := state.count + 1
  { state with count := next, history := state.history ++ [next] }

#eval (increment { count := 0 }).count`,
    idris: `record CounterState where
  constructor MkCounterState
  count : Int
  history : List Int

increment : CounterState -> CounterState
increment state =
  let next = state.count + 1 in
    record { count = next, history = state.history ++ [next] } state`,
    bean: `type CounterState = {
  count: Int,
  history: List<Int>,
}

fn increment(state: CounterState) -> CounterState {
  let next = state.count + 1
  { state with count: next, history: state.history ++ [next] }
}`,
    mojo: `struct CounterState:
    var count: Int
    var history: List[Int]

fn increment(state: CounterState) -> CounterState:
    let next = state.count + 1
    return CounterState(next, [*state.history, next])`,
    c: `typedef struct {
  int count;
  int history[16];
  size_t history_len;
} CounterState;

CounterState increment(CounterState state) {
  int next = state.count + 1;
  state.count = next;
  state.history[state.history_len++] = next;
  return state;
}`,
    d: `struct CounterState {
  int count;
  int[] history;
}

CounterState increment(CounterState state) {
  auto next = state.count + 1;
  return CounterState(next, state.history ~ [next]);
}`,
    moonbit: `type CounterState = {
  count : Int,
  history : Array[Int],
}

fn increment(state : CounterState) -> CounterState {
  let next = state.count + 1
  { state with count: next, history: state.history.push(next) }
}`,
    fsharp: `type CounterState = {
  Count: int
  History: int list
}

let increment state =
  let next = state.Count + 1
  { state with Count = next; History = state.History @ [ next ] }`,
    clojure: `(defn increment [state]
  (let [next (inc (:count state))]
    (-> state
        (assoc :count next)
        (update :history conj next))))

(def state {:count 0 :history []})
(def next-state (increment state))`,
    erlang: `increment(#{count := Count, history := History} = State) ->
    Next = Count + 1,
    State#{count => Next, history => History ++ [Next]}.

State = #{count => 0, history => []},
NextState = increment(State).`,
    gleam: `pub type CounterState {
  CounterState(count: Int, history: List(Int))
}

pub fn increment(state: CounterState) -> CounterState {
  let CounterState(count, history) = state
  let next = count + 1
  CounterState(next, list.append(history, [next]))
}`,
    haskell: `data CounterState = CounterState
  { count :: Int
  , history :: [Int]
  }

increment :: CounterState -> CounterState
increment state =
  let next = count state + 1
   in state {count = next, history = history state ++ [next]}`,
    lisp: `(defstruct counter-state count history)

(defun increment (state)
  (let ((next (+ 1 (counter-state-count state))))
    (make-counter-state
     :count next
     :history (append (counter-state-history state) (list next)))))`,
    lua: `local function increment(state)
  local next = state.count + 1
  local history = { table.unpack(state.history) }
  table.insert(history, next)
  return { count = next, history = history }
end

local state = { count = 0, history = {} }
local next_state = increment(state)`,
    prose: `increment(state):
  let next = state.count + 1
  return {
    count: next,
    history: state.history plus [next],
  }

state.count stays 0 after calling increment(state)`,
    agda: `record CounterState : Set where
  field
    count : ℕ
    history : List ℕ

increment : CounterState → CounterState
increment state =
  let next = suc (CounterState.count state) in
  record state { count = next ; history = CounterState.history state ++ next ∷ [] }`,
    coq: `Record counter_state := {
  count : nat;
  history : list nat;
}.

Definition increment (state : counter_state) : counter_state :=
  let next := S state.(count) in
  {| count := next; history := state.(history) ++ [next] |}.`,
    dream: `type CounterState = {
  count : Int,
  history : List[Int],
}

fn increment(state : CounterState) -> CounterState = {
  let next_count = state.count + 1
  {
    count: next_count,
    history: state.history + [next_count],
  }
}

let state = { count: 0, history: [] }
let next_state = increment(state)

state.count      // => 0
next_state.count // => 1`,
  },
  "pipe-operator": {
    rust: `let revenue = orders
    .iter()
    .filter(|order| order.status == Status::Completed)
    .map(|order| order.total)
    .sum::<f64>();

let revenue_with_tax = (revenue * 1.10 * 100.0).round() / 100.0;`,
    ruby: `revenue = orders
  .select { |order| order.status == :completed }
  .map(&:total)
  .sum
  .then { |total| (total * 1.1).round(2) }

result = "  Hello, World!  "
  .strip
  .downcase
  .gsub(/[^a-z0-9\s]/, "")
  .split
  .join("-")`,
    julia: `using Chain

revenue =
  @chain orders begin
    filter(order -> order.status == :completed, _)
    map(_.total, _)
    sum
    round(_ * 1.1; digits = 2)
  end

result =
  @chain "  Hello, World!  " begin
    strip
    lowercase
    replace(r"[^a-z0-9\s]" => "")
    split
    join(_, "-")
  end`,
    r: `library(magrittr)

revenue <- orders |>
  Filter(function(order) order$status == "completed", x = _) |>
  vapply(function(order) order$total, numeric(1)) |>
  sum() |>
  (function(total) round(total * 1.1, 2))()

result <- "  Hello, World!  " |>
  trimws() |>
  tolower() |>
  gsub("[^a-z0-9[:space:]]", "", x = _) |>
  strsplit("\\s+") |>
  unlist() |>
  paste(collapse = "-")`,
    java: `var revenue = orders.stream()
    .filter(order -> order.status() == Status.COMPLETED)
    .map(Order::total)
    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add)
    .multiply(new java.math.BigDecimal("1.10"));

var result = java.util.Arrays.stream(
        "  Hello, World!  ".trim().toLowerCase().replaceAll("[^a-z0-9\\s]", "").split("\\s+"))
    .collect(java.util.stream.Collectors.joining("-"));`,
    racket: `#lang racket
(require racket/string threading)

(define revenue
  (~>> orders
       (filter (λ (order) (eq? (hash-ref order 'status) 'completed)) _)
       (map (λ (order) (hash-ref order 'total)) _)
       (apply + _)
       (* _ 1.1)
       (real->decimal-string _ 2)))

(define result
  (~>> "  Hello, World!  "
       string-trim
       string-downcase
       (regexp-replace* #px"[^a-z0-9\\s]" _ "")
       string-split
       (string-join _ "-")))`,
    scala: `val revenue =
  orders
    .filter(_.status == Status.Completed)
    .map(_.total)
    .sum
    .pipe(total => BigDecimal(total) * BigDecimal("1.1"))
    .setScale(2)

val result =
  "  Hello, World!  "
    .trim
    .toLowerCase
    .replaceAll("[^a-z0-9\\s]", "")
    .split("\\s+")
    .mkString("-")`,
    shell: `revenue=$(
  printf '%s\n' "$orders" \
    | jq -r '.[] | select(.status == "completed") | .total' \
    | awk '{sum += $1} END {printf "%.2f", sum * 1.1}'
)

echo "$revenue"

result=$(
  printf '%s' '  Hello, World!  ' \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/^[[:space:]]+|[[:space:]]+$//g; s/[^a-z0-9[:space:]]//g; s/[[:space:]]+/-/g'
)`,
    cpp: `auto completed = orders
  | std::views::filter([](const Order& order) { return order.status == Status::completed; })
  | std::views::transform([](const Order& order) { return order.total; });

auto revenue = std::accumulate(completed.begin(), completed.end(), 0.0) * 1.1;

auto result = join(
  split(regex_replace(lowercase(trim("  Hello, World!  ")), std::regex("[^a-z0-9\\s]"), "")),
  "-"
);`,
    perl: `use List::Util qw(sum);

my $revenue = sprintf '%.2f',
  sum(map { $_->{total} } grep { $_->{status} eq 'completed' } @orders) * 1.1;

my $result = lc '  Hello, World!  ';
$result =~ s/^\s+|\s+$//g;
$result =~ s/[^a-z0-9\s]//g;
$result =~ s/\s+/-/g;`,
    javascript: `const revenue = orders
  .filter((order) => order.status === "completed")
  .map((order) => order.total)
  .reduce((sum, total) => sum + total, 0);

console.log("Revenue:", Math.round(revenue * 1.1 * 100) / 100);

const result = "  Hello, World!  "
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, "")
  .split(/\s+/)
  .join("-");`,
    php: `$completed = array_filter($orders, fn(array $order) => $order['status'] === 'completed');
$totals = array_map(fn(array $order) => $order['total'], $completed);
$revenue = round(array_sum($totals) * 1.1, 2);

$result = implode(
    '-',
    preg_split(
        '/\s+/',
        preg_replace('/[^a-z0-9\s]/', '', strtolower(trim('  Hello, World!  ')))
    )
);`,
    zig: `const cleaned = std.mem.trim(u8, "  Hello, World!  ", " ");
const lowered = try std.ascii.allocLowerString(allocator, cleaned);
const alnum = try stripNonAlnum(allocator, lowered);
const result = try joinWhitespaceWithDash(allocator, alnum);

var total: f64 = 0;
for (orders) |order| {
    if (order.status == .completed) total += order.total;
}
const revenue = std.math.round(total * 1.1 * 100) / 100;`,
    lean: `def revenue : Float :=
  orders
    |> List.filter (fun order => order.status = Status.completed)
    |> List.map (fun order => order.total)
    |> List.foldl (· + ·) 0
    |> fun total => total * 1.1

def result : String :=
  "  Hello, World!  "
    |> String.trim
    |> String.toLower
    |> cleanAscii
    |> String.words
    |> String.intercalate "-"`,
    idris: `revenue : Double
revenue =
  orders
    |> filter (\order => order.status == Completed)
    |> map (.total)
    |> sum
    |> (\total => total * 1.1)

result : String
result =
  "  Hello, World!  "
    |> trim
    |> toLower
    |> stripNonAlphaNum
    |> words
    |> joinBy "-"`,
    bean: `let revenue =
  orders
    |> filter(order => order.status == Completed)
    |> map(order => order.total)
    |> sum()
    |> then(total => total * 1.1)
    |> round(2)

let result =
  "  Hello, World!  "
    |> trim()
    |> lowercase()
    |> replace(/[^a-z0-9\s]/, "")
    |> split_whitespace()
    |> join("-")`,
    mojo: `let revenue = orders \
    .filter(fn(order): order.status == "completed") \
    .map(fn(order): order.total) \
    .sum() \
    .then(fn(total): round(total * 1.1, 2))

let result = (
    "  Hello, World!  "
      .strip()
      .lower()
      .replace_regex("[^a-z0-9\\s]", "")
      .split_whitespace()
      .join("-")
)`,
    c: `double revenue = 0.0;
for (size_t i = 0; i < order_count; ++i) {
  if (orders[i].status == STATUS_COMPLETED) {
    revenue += orders[i].total;
  }
}
revenue = round(revenue * 1.1 * 100.0) / 100.0;

char text[] = "  Hello, World!  ";
trim_in_place(text);
lowercase_in_place(text);
strip_non_alnum(text);
replace_spaces_with_dashes(text);`,
    d: `import std.algorithm : filter, map, sum;

auto revenue = orders
  .filter!(order => order.status == Status.completed)
  .map!(order => order.total)
  .sum
  .pipe!(total => round(total * 1.1, 2));

auto result = "  Hello, World!  "
  .strip
  .toLower
  .replaceAll(regex("[^a-z0-9\\s]"), "")
  .splitter
  .join("-");`,
    moonbit: `let revenue =
  orders
    .filter(order => order.status == Completed)
    .map(order => order.total)
    .sum()
    .pipe(total => round(total * 1.1, 2))

let result =
  "  Hello, World!  "
    .trim()
    .lowercase()
    .replace_regex("[^a-z0-9\\s]", "")
    .split_whitespace()
    .join("-")`,
    fsharp: `let revenue =
  orders
  |> List.filter (fun order -> order.Status = Completed)
  |> List.map (fun order -> order.Total)
  |> List.sum
  |> fun total -> total * 1.1m
  |> fun total -> System.Decimal.Round(total, 2)

let result =
  "  Hello, World!  "
  |> _.Trim()
  |> _.ToLowerInvariant()
  |> cleanAscii
  |> fun text -> text.Split(' ', System.StringSplitOptions.RemoveEmptyEntries)
  |> String.concat "-"`,
    clojure: `(def revenue
  (->> orders
       (filter #(= :completed (:status %)))
       (map :total)
       (reduce +)
       (* 1.1)
       (#(Math/round (* % 100)))
       (/ 100.0)))

(def result
  (-> "  Hello, World!  "
      clojure.string/trim
      clojure.string/lower-case
      (clojure.string/replace #"[^a-z0-9\s]" "")
      (clojure.string/split #"\s+")
      ((partial clojure.string/join "-"))))`,
    erlang: `Revenue =
    Orders
    |> lists:filter(fun(Order) -> maps:get(status, Order) =:= completed end)
    |> lists:map(fun(Order) -> maps:get(total, Order) end)
    |> lists:sum(),

Result =
    "  Hello, World!  "
    |> string:trim()
    |> string:lowercase()
    |> re:replace("[^a-z0-9\\s]", "", [global, {return, list}])
    |> string:split(" ", all)
    |> string:join("-").`,
    gleam: `let revenue =
  orders
  |> list.filter(fn(order) { order.status == Completed })
  |> list.map(fn(order) { order.total })
  |> int.sum
  |> fn(total) { total * 11 / 10 }

let result =
  "  Hello, World!  "
  |> string.trim
  |> string.lowercase
  |> strip_non_alnum
  |> string.split(" ")
  |> string.join("-")`,
    haskell: `revenue :: Double
revenue =
  orders
    & filter ((== Completed) . status)
    & map total
    & sum
    & (* 1.1)

result :: String
result =
  "  Hello, World!  "
    & trim
    & lowercase
    & filter isAlphaNumOrSpace
    & words
    & intercalate "-"`,
    lisp: `(defparameter *revenue*
  (->> *orders*
       (remove-if-not (lambda (order) (eq (getf order :status) :completed)))
       (mapcar (lambda (order) (getf order :total)))
       (reduce #'+)
       (* 1.1)))

(defparameter *result*
  (-> "  Hello, World!  "
      string-trim-whitespace
      string-downcase
      strip-non-alnum
      words
      (join-with "-")))`,
    lua: `local revenue = fold(
  filter(orders, function(order)
    return order.status == "completed"
  end),
  0,
  function(sum, order)
    return sum + order.total
  end
) * 1.1

local result = join(
  split((trim("  Hello, World!  "):lower():gsub("[^a-z0-9%s]", "")), "%s+"),
  "-"
)`,
    prose: `revenue = orders
  -> keep only completed
  -> project totals
  -> sum
  -> multiply by 1.1
  -> round to 2 decimals

"  Hello, World!  "
  -> trim
  -> lowercase
  -> remove punctuation
  -> split on whitespace
  -> join with "-"`,
    agda: `revenue : Float
revenue =
  orders
    |> filter (λ order → status order ≡ completed)
    |> map total
    |> sum
    |> λ total → total * 1.1

result : String
result =
  "  Hello, World!  "
    |> trim
    |> toLower
    |> stripNonAlphaNum
    |> words
    |> join "-"`,
    coq: `Definition revenue :=
  orders
  |> filter (fun order => status order = Completed)
  |> map total
  |> fold_left Z.add 0
  |> fun total => total * 11 / 10.

Definition result :=
  "  Hello, World!  "
  |> trim
  |> lowercase
  |> strip_non_alnum
  |> words
  |> join_with "-".`,
    dream: `fn is_completed(order : Order) -> Bool =
  order.status == "completed"

fn total(order : Order) -> Float =
  order.total

fn add_tax(amount : Float) -> Float =
  Float.round(amount * 1.1, 2)

let revenue =
  orders
  |> List.filter(is_completed)
  |> List.map(total)
  |> List.sum()
  |> add_tax

let slug =
  "  Hello, World!  "
  |> String.trim()
  |> String.lowercase()
  |> String.replace(",", "")
  |> String.replace("!", "")
  |> String.split(" ")
  |> String.join("-")
// => "hello-world"`,
  },
  "with-statement": {
    rust: `fn create_order(params: OrderParams) -> Result<Order, CreateOrderError> {
    let user = authenticate(&params.token)?;
    let items = validate_items(&params.items)?;
    let payment = charge_card(&user, &items)?;
    let order = save_order(&user, &items, &payment)?;

    send_confirmation(&user, &order)?;
    Ok(order)
}`,
    ruby: `require "dry/monads"
require "dry/monads/do"

class Orders
  include Dry::Monads[:result]
  include Dry::Monads::Do.for(:create_order)

  def create_order(params)
    user = yield authenticate(params[:token])
    items = yield validate_items(params[:items])
    payment = yield charge_card(user, items)
    order = yield save_order(user, items, payment)
    send_confirmation(user, order)
    Success(order)
  end
end`,
    julia: `using ResultTypes

function create_order(params)
    user = unwrap(authenticate(params.token))
    items = unwrap(validate_items(params.items))
    payment = unwrap(charge_card(user, items))
    order = unwrap(save_order(user, items, payment))
    send_confirmation(user, order)
    Result(order)
end`,
    r: `ok <- function(value) list(ok = TRUE, value = value)
err <- function(message) list(ok = FALSE, error = message)

create_order <- function(params) {
  user <- authenticate(params$token)
  if (!user$ok) return(err("Please log in"))

  items <- validate_items(params$items)
  if (!items$ok) return(err("Invalid cart"))

  payment <- charge_card(user$value, items$value)
  if (!payment$ok) return(err("Payment declined"))

  order <- save_order(user$value, items$value, payment$value)
  if (!order$ok) return(order)

  send_confirmation(user$value, order$value)
  ok(order$value)
}`,
    java: `Result<Order, OrderError> createOrder(OrderParams params) {
  return authenticate(params.token())
      .flatMap(user -> validateItems(params.items())
          .flatMap(items -> chargeCard(user, items)
              .flatMap(payment -> saveOrder(user, items, payment)
                  .map(order -> {
                    sendConfirmation(user, order);
                    return order;
                  }))));
}`,
    racket: `#lang racket
(struct ok (value) #:transparent)
(struct err (reason) #:transparent)

(define (create-order params)
  (match (authenticate (hash-ref params 'token))
    [(err reason) (err "Please log in")]
    [(ok user)
     (match (validate-items (hash-ref params 'items))
       [(err reason) (err "Invalid cart")]
       [(ok items)
        (match (charge-card user items)
          [(err reason) (err "Payment declined")]
          [(ok payment)
           (match (save-order user items payment)
             [(ok order) (begin (send-confirmation user order) (ok order))]
             [(err reason) (err reason)])])])]))`,
    scala: `def createOrder(params: OrderParams): Either[OrderError, Order] =
  for
    user <- authenticate(params.token).left.map(_ => OrderError.PleaseLogIn)
    items <- validateItems(params.items).left.map(_ => OrderError.InvalidCart)
    payment <- chargeCard(user, items).left.map(_ => OrderError.PaymentDeclined)
    order <- saveOrder(user, items, payment)
  yield
    sendConfirmation(user, order)
    order`,
    shell: `create_order() {
  local token=$1
  local items=$2

  user=$(authenticate "$token") || { echo 'Please log in'; return 1; }
  valid_items=$(validate_items "$items") || { echo 'Invalid cart'; return 1; }
  payment=$(charge_card "$user" "$valid_items") || { echo 'Payment declined'; return 1; }
  order=$(save_order "$user" "$valid_items" "$payment") || return 1

  send_confirmation "$user" "$order"
  printf '%s\n' "$order"
}`,
    cpp: `auto create_order(const OrderParams& params) -> std::expected<Order, OrderError> {
  auto user = authenticate(params.token);
  if (!user) return std::unexpected(OrderError::please_log_in());

  auto items = validate_items(params.items);
  if (!items) return std::unexpected(OrderError::invalid_cart());

  auto payment = charge_card(*user, *items);
  if (!payment) return std::unexpected(OrderError::payment_declined());

  auto order = save_order(*user, *items, *payment);
  if (!order) return std::unexpected(order.error());

  send_confirmation(*user, *order);
  return *order;
}`,
    perl: `sub create_order ($params) {
  my $user = authenticate($params->{token}) or return { ok => 0, error => 'Please log in' };
  my $items = validate_items($params->{items}) or return { ok => 0, error => 'Invalid cart' };
  my $payment = charge_card($user, $items) or return { ok => 0, error => 'Payment declined' };
  my $order = save_order($user, $items, $payment) or return { ok => 0, error => 'Order failed' };

  send_confirmation($user, $order);
  return { ok => 1, value => $order };
}`,
    javascript: `function createOrder(params) {
  return authenticate(params.token)
    .mapErr(() => ({ type: "please_log_in" }))
    .andThen((user) =>
      validateItems(params.items)
        .mapErr(() => ({ type: "invalid_cart" }))
        .andThen((items) =>
          chargeCard(user, items)
            .mapErr(() => ({ type: "payment_declined" }))
            .andThen((payment) =>
              saveOrder(user, items, payment).map((order) => {
                sendConfirmation(user, order);
                return order;
              }),
            ),
        ),
    );
}`,
    php: `function createOrder(OrderParams $params): Result
{
    return authenticate($params->token)
        ->mapError(fn() => 'Please log in')
        ->flatMap(fn(User $user) => validateItems($params->items)
            ->mapError(fn() => 'Invalid cart')
            ->flatMap(fn(array $items) => chargeCard($user, $items)
                ->mapError(fn() => 'Payment declined')
                ->flatMap(fn(Payment $payment) => saveOrder($user, $items, $payment)
                    ->map(function (Order $order) use ($user) {
                        sendConfirmation($user, $order);
                        return $order;
                    }))));
}`,
    zig: `fn createOrder(params: OrderParams) !Order {
    const user = try authenticate(params.token);
    const items = try validateItems(params.items);
    const payment = try chargeCard(user, items);
    const order = try saveOrder(user, items, payment);
    try sendConfirmation(user, order);
    return order;
}`,
    lean: `def createOrder (params : OrderParams) : Except OrderError Order := do
  let user ← authenticate params.token |>.mapError (fun _ => .pleaseLogIn)
  let items ← validateItems params.items |>.mapError (fun _ => .invalidCart)
  let payment ← chargeCard user items |>.mapError (fun _ => .paymentDeclined)
  let order ← saveOrder user items payment
  sendConfirmation user order
  pure order`,
    idris: `createOrder : OrderParams -> Either OrderError Order
createOrder params = do
  user <- mapLeft (const PleaseLogIn) (authenticate params.token)
  items <- mapLeft (const InvalidCart) (validateItems params.items)
  payment <- mapLeft (const PaymentDeclined) (chargeCard user items)
  order <- saveOrder user items payment
  Right (confirm user order)
  where
    confirm : User -> Order -> Order
    confirm user order = sendConfirmation user order \`seq\` order`,
    bean: `fn create_order(params: OrderParams) -> Result<Order, OrderError> =
  authenticate(params.token)
    .map_err(_ => PleaseLogIn)
    .and_then(user =>
      validate_items(params.items)
        .map_err(_ => InvalidCart)
        .and_then(items =>
          charge_card(user, items)
            .map_err(_ => PaymentDeclined)
            .and_then(payment =>
              save_order(user, items, payment)
                .map(order => {
                  send_confirmation(user, order)
                  order
                })
            )
        )
    )`,
    mojo: `fn create_order(params: OrderParams) -> Result[Order, OrderError]:
    let user = authenticate(params.token)?
    let items = validate_items(params.items)?
    let payment = charge_card(user, items)?
    let order = save_order(user, items, payment)?
    send_confirmation(user, order)
    return Result.ok(order)`,
    c: `CreateOrderResult create_order(OrderParams params) {
  UserResult user = authenticate(params.token);
  if (!user.ok) return create_order_error(PLEASE_LOG_IN);

  ItemsResult items = validate_items(params.items);
  if (!items.ok) return create_order_error(INVALID_CART);

  PaymentResult payment = charge_card(user.value, items.value);
  if (!payment.ok) return create_order_error(PAYMENT_DECLINED);

  OrderResult order = save_order(user.value, items.value, payment.value);
  if (!order.ok) return create_order_error(order.error);

  send_confirmation(user.value, order.value);
  return create_order_ok(order.value);
}`,
    d: `Result!(Order, OrderError) createOrder(OrderParams params) {
  auto user = authenticate(params.token);
  if (user.isError) return typeof(return)(OrderError.pleaseLogIn());

  auto items = validateItems(params.items);
  if (items.isError) return typeof(return)(OrderError.invalidCart());

  auto payment = chargeCard(user.get, items.get);
  if (payment.isError) return typeof(return)(OrderError.paymentDeclined());

  auto order = saveOrder(user.get, items.get, payment.get);
  if (order.isError) return typeof(return)(order.error);

  sendConfirmation(user.get, order.get);
  return typeof(return)(order.get);
}`,
    moonbit: `fn create_order(params : OrderParams) -> Result[Order, OrderError] {
  match authenticate(params.token) {
    Err(_) => Err(PleaseLogIn)
    Ok(user) =>
      match validate_items(params.items) {
        Err(_) => Err(InvalidCart)
        Ok(items) =>
          match charge_card(user, items) {
            Err(_) => Err(PaymentDeclined)
            Ok(payment) =>
              save_order(user, items, payment).map(order => {
                send_confirmation(user, order)
                order
              })
          }
      }
  }
}`,
    fsharp: `let createOrder params =
  result {
    let! user = authenticate params.Token |> Result.mapError (fun _ -> PleaseLogIn)
    let! items = validateItems params.Items |> Result.mapError (fun _ -> InvalidCart)
    let! payment = chargeCard user items |> Result.mapError (fun _ -> PaymentDeclined)
    let! order = saveOrder user items payment
    do sendConfirmation user order
    return order
  }`,
    clojure: `(defn create-order [params]
  (if-let [[_ user] (authenticate (:token params))]
    (if-let [[_ items] (validate-items (:items params))]
      (if-let [[_ payment] (charge-card user items)]
        (if-let [[_ order] (save-order user items payment)]
          (do (send-confirmation user order)
              [:ok order])
          [:error :order_failed])
        [:error :payment_declined])
      [:error :invalid_cart])
    [:error :please_log_in]))`,
    erlang: `create_order(#{token := Token, items := RawItems}) ->
    case authenticate(Token) of
        {ok, User} ->
            case validate_items(RawItems) of
                {ok, Items} ->
                    case charge_card(User, Items) of
                        {ok, Payment} ->
                            case save_order(User, Items, Payment) of
                                {ok, Order} ->
                                    send_confirmation(User, Order),
                                    {ok, Order};
                                Error -> Error
                            end;
                        {error, _} -> {error, payment_declined}
                    end;
                {error, _} -> {error, invalid_cart}
            end;
        {error, _} -> {error, please_log_in}
    end.`,
    gleam: `pub fn create_order(params: OrderParams) -> Result(Order, OrderError) {
  use user <- result.try(authenticate(params.token) |> result.map_error(fn(_) { PleaseLogIn }))
  use items <- result.try(validate_items(params.items) |> result.map_error(fn(_) { InvalidCart }))
  use payment <- result.try(charge_card(user, items) |> result.map_error(fn(_) { PaymentDeclined }))
  use order <- result.try(save_order(user, items, payment))
  send_confirmation(user, order)
  Ok(order)
}`,
    haskell: `createOrder :: OrderParams -> Either OrderError Order
createOrder params = do
  user <- first (const PleaseLogIn) (authenticate (token params))
  items <- first (const InvalidCart) (validateItems (items params))
  payment <- first (const PaymentDeclined) (chargeCard user items)
  order <- saveOrder user items payment
  pure (confirm user order)
  where
    confirm user order = sendConfirmation user order \`seq\` order`,
    lisp: `(defmacro let-result* (bindings &body body)
  ;; expands to nested short-circuiting result matches
  )

(defun create-order (params)
  (let-result* ((user (authenticate (getf params :token)))
                (items (validate-items (getf params :items)))
                (payment (charge-card user items))
                (order (save-order user items payment)))
    (send-confirmation user order)
    (list :ok order)))`,
    lua: `local function create_order(params)
  local user, user_error = authenticate(params.token)
  if not user then return nil, "please_log_in" end

  local items, items_error = validate_items(params.items)
  if not items then return nil, "invalid_cart" end

  local payment, payment_error = charge_card(user, items)
  if not payment then return nil, "payment_declined" end

  local order, order_error = save_order(user, items, payment)
  if not order then return nil, order_error end

  send_confirmation(user, order)
  return order
end`,
    prose: `create_order(params):
  user = authenticate(params.token) or fail "Please log in"
  items = validate_items(params.items) or fail "Invalid cart"
  payment = charge_card(user, items) or fail "Payment declined"
  order = save_order(user, items, payment) or fail "Order failed"
  send_confirmation(user, order)
  return order`,
    agda: `createOrder : OrderParams → OrderError ⊎ Order
createOrder params = do
  user ← mapLeft (λ _ → pleaseLogIn) (authenticate (token params))
  items ← mapLeft (λ _ → invalidCart) (validateItems (items params))
  payment ← mapLeft (λ _ → paymentDeclined) (chargeCard user items)
  order ← saveOrder user items payment
  inj₂ order`,
    coq: `Definition create_order (params : order_params) : result order_error order :=
  user <- authenticate params.(token) ;;
  items <- validate_items params.(items) ;;
  payment <- charge_card user items ;;
  order <- save_order user items payment ;;
  Ok order.`,
    dream: `type CreateOrderError =
  | Unauthorized
  | InvalidItems
  | PaymentFailed
  | OrderFailed(String)

fn create_order(params : OrderParams) -> Result<Order, CreateOrderError> = {
  let user = authenticate(params.token)?
  let items = validate_items(params.items)?
  let payment = charge_card(user, items)?
  let order = save_order(user, items, payment)?

  send_confirmation(user, order)
  Ok(order)
}`,
  },
  "concurrency": {
    rust: `use tokio::sync::{mpsc, oneshot};

enum Command {
    Increment { reply: oneshot::Sender<i32> },
    Get { reply: oneshot::Sender<i32> },
}

async fn counter(mut inbox: mpsc::Receiver<Command>) {
    let mut count = 0;
    while let Some(command) = inbox.recv().await {
        match command {
            Command::Increment { reply } => {
                count += 1;
                let _ = reply.send(count);
            }
            Command::Get { reply } => {
                let _ = reply.send(count);
            }
        }
    }
}`,
    ruby: `require "ractor"

counter = Ractor.new(0) do |count|
  loop do
    message, reply_to = Ractor.receive
    case message
    when :increment
      count += 1
      reply_to.send(count)
    when :get
      reply_to.send(count)
    end
  end
end

def ask(counter, message)
  inbox = Ractor.new do
    Ractor.receive
  end
  counter.send([message, inbox])
  inbox.take
end

ask(counter, :increment) # => 1
ask(counter, :increment) # => 2
ask(counter, :get)       # => 2`,
    julia: `struct Increment
    reply::Channel{Int}
end

struct Get
    reply::Channel{Int}
end

function counter(initial::Int)
    mailbox = Channel{Any}(32)
    @async begin
        count = initial
        for command in mailbox
            if command isa Increment
                count += 1
                put!(command.reply, count)
            elseif command isa Get
                put!(command.reply, count)
            end
        end
    end
    mailbox
end

mailbox = counter(0)`,
    r: `library(later)

counter <- local({
  count <- 0L
  inbox <- list()

  run <- function() {
    while (length(inbox) > 0) {
      message <- inbox[[1]]
      inbox <<- inbox[-1]
      if (message$type == "increment") {
        count <<- count + 1L
        message$reply(count)
      } else if (message$type == "get") {
        message$reply(count)
      }
    }
  }

  list(
    send = function(message) {
      inbox <<- c(inbox, list(message))
      later(run)
    }
  )
})`,
    java: `import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

sealed interface Command permits Increment, Get {}
record Increment(java.util.concurrent.CompletableFuture<Integer> reply) implements Command {}
record Get(java.util.concurrent.CompletableFuture<Integer> reply) implements Command {}

final class Counter {
  private final BlockingQueue<Command> mailbox = new LinkedBlockingQueue<>();

  Counter(int initial) {
    Thread.ofVirtual().start(() -> {
      var count = initial;
      while (true) {
        var command = mailbox.take();
        switch (command) {
          case Increment(var reply) -> reply.complete(++count);
          case Get(var reply) -> reply.complete(count);
        }
      }
    });
  }
}`,
    racket: `#lang racket
(struct increment (reply) #:transparent)
(struct get (reply) #:transparent)

(define mailbox (make-channel))

(thread
 (lambda ()
   (let loop ([count 0])
     (match (channel-get mailbox)
       [(increment reply)
        (define next (add1 count))
        (channel-put reply next)
        (loop next)]
       [(get reply)
        (channel-put reply count)
        (loop count)]))))

(define (ask message)
  (define reply (make-channel))
  (channel-put mailbox message)
  (channel-get reply))`,
    scala: `import java.util.concurrent.LinkedBlockingQueue
import scala.concurrent.Promise

sealed trait Command
final case class Increment(reply: Promise[Int]) extends Command
final case class Get(reply: Promise[Int]) extends Command

final class Counter(initial: Int):
  private val mailbox = LinkedBlockingQueue[Command]()
  private val worker = Thread.ofVirtual().start(() =>
    var count = initial
    while true do
      mailbox.take() match
        case Increment(reply) =>
          count += 1
          reply.success(count)
        case Get(reply) =>
          reply.success(count)
  )`,
    shell: `mkfifo counter.in counter.out

counter() {
  local count=$1
  while read -r command; do
    case "$command" in
      increment)
        count=$((count + 1))
        printf '%s\n' "$count" > counter.out
        ;;
      get)
        printf '%s\n' "$count" > counter.out
        ;;
    esac
  done < counter.in
}

counter 0 &
printf 'increment\n' > counter.in
read -r value < counter.out`,
    cpp: `struct Increment { std::promise<int> reply; };
struct Get { std::promise<int> reply; };
using Command = std::variant<Increment, Get>;

std::queue<Command> mailbox;
std::mutex mutex;
std::condition_variable ready;

std::jthread counter([&] {
  int count = 0;
  while (true) {
    std::unique_lock lock(mutex);
    ready.wait(lock, [&] { return !mailbox.empty(); });
    auto command = std::move(mailbox.front());
    mailbox.pop();
    lock.unlock();

    std::visit(overloaded{
      [&](Increment& msg) { msg.reply.set_value(++count); },
      [&](Get& msg) { msg.reply.set_value(count); },
    }, command);
  }
});`,
    perl: `use threads;
use Thread::Queue;

my $mailbox = Thread::Queue->new();
threads->create(sub {
  my $count = 0;
  while (my $command = $mailbox->dequeue()) {
    if ($command->{type} eq 'increment') {
      $count += 1;
      $command->{reply}->enqueue($count);
    } elsif ($command->{type} eq 'get') {
      $command->{reply}->enqueue($count);
    }
  }
})->detach();`,
    javascript: `import { Worker } from "node:worker_threads";

const worker = new Worker(
  \`
    const { parentPort } = require("node:worker_threads");
    let count = 0;
    parentPort.on("message", ({ type, id }) => {
      if (type === "increment") count += 1;
      parentPort.postMessage({ id, value: count });
    });
  \`,
  { eval: true },
);

let nextId = 0;
const pending = new Map();
worker.on("message", ({ id, value }) => pending.get(id)?.(value));`,
    php: `$channel = new parallel\Channel();

$runtime = new parallel\Runtime();
$runtime->run(function (parallel\Channel $mailbox) {
    $count = 0;
    while (true) {
        [$type, $reply] = $mailbox->recv();
        if ($type === 'increment') {
            $reply->send(++$count);
        } elseif ($type === 'get') {
            $reply->send($count);
        }
    }
}, [$channel]);`,
    zig: `const std = @import("std");

const CommandTag = enum { increment, get };
const Command = struct {
    tag: CommandTag,
    reply: *std.Thread.ResetEvent,
    value: *i32,
};

var mailbox = std.fifo.LinearFifo(Command, .Dynamic).init(allocator);
var mutex = std.Thread.Mutex{};
var ready = std.Thread.Condition{};

fn counter(initial: i32) void {
    var count = initial;
    while (true) {
        mutex.lock();
        defer mutex.unlock();
        while (mailbox.readableLength() == 0) ready.wait(&mutex);
        const command = mailbox.readItem().?;
        switch (command.tag) {
            .increment => { count += 1; command.value.* = count; },
            .get => command.value.* = count,
        }
        command.reply.set();
    }
}`,
    lean: `inductive Command where
  | increment (reply : IO.Ref Nat)
  | get (reply : IO.Ref Nat)

structure Counter where
  mailbox : IO.Mutex (List Command)

partial def run (counter : Counter) (count : Nat) : IO Unit := do
  let command :: _rest ← counter.mailbox.atomically fun queue =>
    return (queue, queue)
  match command with
  | .increment reply =>
      let next := count + 1
      reply.set next
      run counter next
  | .get reply =>
      reply.set count
      run counter count`,
    idris: `data Command = Increment (IORef Int) | Get (IORef Int)

counter : IO (Channel Command)
counter = do
  mailbox <- makeChannel
  _ <- fork $ loop mailbox 0
  pure mailbox
  where
    loop : Channel Command -> Int -> IO ()
    loop mailbox count = do
      command <- recv mailbox
      case command of
        Increment reply => do
          let next = count + 1
          writeIORef reply next
          loop mailbox next
        Get reply => do
          writeIORef reply count
          loop mailbox count`,
    bean: `type Command =
  | Increment(Reply<Int>)
  | Get(Reply<Int>)

fn counter(initial: Int) -> Mailbox<Command> {
  spawn(initial, fn(mailbox, mut count) {
    loop {
      match mailbox.receive() {
        Increment(reply) => {
          count = count + 1
          reply.send(count)
        }
        Get(reply) => reply.send(count)
      }
    }
  })
}`,
    mojo: `from concurrency import Channel, spawn

alias Command = Variant[Increment, Get]
struct Increment:
    var reply: Channel[Int]
struct Get:
    var reply: Channel[Int]

fn counter(initial: Int) -> Channel[Command]:
    let mailbox = Channel[Command]()
    _ = spawn(fn():
        var count = initial
        while True:
            match mailbox.recv():
                case Increment(reply):
                    count += 1
                    reply.send(count)
                case Get(reply):
                    reply.send(count)
    )
    return mailbox`,
    c: `typedef enum { CMD_INCREMENT, CMD_GET } CommandTag;

typedef struct {
  CommandTag tag;
  int *reply;
  pthread_mutex_t *reply_mutex;
  pthread_cond_t *reply_ready;
} Command;

void *counter_thread(void *ctx) {
  int count = 0;
  for (;;) {
    Command command = mailbox_pop();
    if (command.tag == CMD_INCREMENT) count += 1;
    pthread_mutex_lock(command.reply_mutex);
    *command.reply = count;
    pthread_cond_signal(command.reply_ready);
    pthread_mutex_unlock(command.reply_mutex);
  }
}`,
    d: `import core.thread;
import std.concurrency;

enum CommandTag { increment, get }
struct Increment { Tid reply; }
struct Get { Tid reply; }

void counter() {
  int count = 0;
  for (;;) {
    receive(
      (Increment msg) { send(msg.reply, ++count); },
      (Get msg) { send(msg.reply, count); },
    );
  }
}

auto server = spawn(&counter);`,
    moonbit: `enum Command {
  Increment(Channel[Int])
  Get(Channel[Int])
}

fn counter(initial : Int) -> Channel[Command] {
  let mailbox = Channel::new()
  spawn(fn() {
    let mut count = initial
    loop {
      match mailbox.recv() {
        Increment(reply) => {
          count = count + 1
          reply.send(count)
        }
        Get(reply) => reply.send(count)
      }
    }
  })
  mailbox
}`,
    fsharp: `open System.Threading.Channels

type Command =
  | Increment of AsyncReplyChannel<int>
  | Get of AsyncReplyChannel<int>

let counter initial =
  MailboxProcessor.Start(fun inbox ->
    let rec loop count = async {
      let! command = inbox.Receive()
      match command with
      | Increment reply ->
          let next = count + 1
          reply.Reply next
          return! loop next
      | Get reply ->
          reply.Reply count
          return! loop count
    }
    loop initial)`,
    clojure: `(require '[clojure.core.async :as a])

(defn counter [initial]
  (let [mailbox (a/chan)]
    (a/go-loop [count initial]
      (when-let [[op reply] (a/<! mailbox)]
        (case op
          :increment (do (a/>! reply (inc count)) (recur (inc count)))
          :get       (do (a/>! reply count) (recur count)))))
    mailbox))`,
    erlang: `counter(Count) ->
    receive
        {increment, From} ->
            Next = Count + 1,
            From ! {ok, Next},
            counter(Next);
        {get, From} ->
            From ! {ok, Count},
            counter(Count)
    end.

Pid = spawn(fun() -> counter(0) end).`,
    gleam: `import gleam/otp/actor

pub type Message {
  Increment(actor.Sender(Int))
  Get(actor.Sender(Int))
}

pub fn counter(initial: Int) {
  actor.start(initial, fn(message, count) {
    case message {
      Increment(reply) -> {
        let next = count + 1
        actor.send(reply, next)
        actor.continue(next)
      }
      Get(reply) -> {
        actor.send(reply, count)
        actor.continue(count)
      }
    }
  })
}`,
    haskell: `import Control.Concurrent
import Control.Concurrent.Chan

data Command
  = Increment (MVar Int)
  | Get (MVar Int)

counter :: Int -> IO (Chan Command)
counter initial = do
  mailbox <- newChan
  _ <- forkIO (loop mailbox initial)
  pure mailbox
  where
    loop mailbox count = do
      command <- readChan mailbox
      case command of
        Increment reply -> do
          let next = count + 1
          putMVar reply next
          loop mailbox next
        Get reply -> do
          putMVar reply count
          loop mailbox count`,
    lisp: `(defstruct increment reply)
(defstruct get reply)

(defparameter *mailbox* (lparallel.queue:make-queue))

(bt:make-thread
 (lambda ()
   (loop with count = 0
         for command = (lparallel.queue:pop-queue *mailbox*) do
           (typecase command
             (increment
              (incf count)
              (setf (symbol-value (increment-reply command)) count))
             (get
              (setf (symbol-value (get-reply command)) count))))))`,
    lua: `local mailbox = require("channel").new()

local function counter(initial)
  coroutine.wrap(function()
    local count = initial
    while true do
      local command = mailbox:recv()
      if command.type == "increment" then
        count = count + 1
        command.reply:send(count)
      elseif command.type == "get" then
        command.reply:send(count)
      end
    end
  end)()
end

counter(0)`,
    prose: `start a counter process with count = 0

forever:
  receive message
  when message is increment(reply):
    count = count + 1
    send count to reply
  when message is get(reply):
    send count to reply`,
    agda: `data Command : Set where
  increment : Reply Nat -> Command
  get : Reply Nat -> Command

counter : Nat -> Process Command
counter count =
  receive λ where
    (increment reply) -> send reply (suc count) >> counter (suc count)
    (get reply) -> send reply count >> counter count`,
    coq: `Inductive command :=
| Increment : reply_chan nat -> command
| Get : reply_chan nat -> command.

CoFixpoint counter (count : nat) : process command :=
  recv (fun msg =>
    match msg with
    | Increment reply => send reply (S count) ;; counter (S count)
    | Get reply => send reply count ;; counter count
    end).`,
    dream: `type Command =
  | Increment(Reply[Int])
  | Get(Reply[Int])

fn counter(count : Int, inbox : Mailbox[Command]) -> Never = {
  match inbox.receive()
    Increment(reply) => {
      let next = count + 1
      reply.send(next)
      counter(next, inbox)
    }
    Get(reply) => {
      reply.send(count)
      counter(count, inbox)
    }
}

let inbox = Mailbox.new[Command]()
spawn(fn () => counter(0, inbox))

inbox.ask(Increment) // => 1
inbox.ask(Increment) // => 2
inbox.ask(Get)       // => 2`,
  },
  "comprehensions": {
    rust: `let pairs: Vec<(i32, i32)> = (1..=10)
    .flat_map(|x| {
        (1..=10)
            .filter(move |y| x + y > 12 && (x * y) % 3 == 0)
            .map(move |y| (x, y))
    })
    .collect();

let honor_roll: Vec<_> = lines
    .iter()
    .filter_map(|line| parse_honor_roll_entry(line))
    .collect();`,
    ruby: `lines = ["Alice,88", "Bob,72", "Carol,91"]

HonorRollEntry = Data.define(:name, :score, :grade)

pairs = (1..10).flat_map do |x|
  (1..10).filter_map do |y|
    [x, y] if x + y > 12 && (x * y) % 3 == 0
  end
end

honor_roll = lines.filter_map do |line|
  name, score_text = line.split(",", 2)
  score = score_text.strip.to_i
  HonorRollEntry.new(name: name.strip, score: score, grade: "A") if score > 80
end`,
    julia: `lines = ["Alice,88", "Bob,72", "Carol,91"]

pairs = [(x, y) for x in 1:10 for y in 1:10 if x + y > 12 && (x * y) % 3 == 0]

honor_roll = [
    (name = strip(name), score = score, grade = "A")
    for line in lines
    let parts = split(line, ",", limit = 2)
    let name = parts[1]
    let score = parse(Int, strip(parts[2]))
    if score > 80
]`,
    r: `lines <- c("Alice,88", "Bob,72", "Carol,91")

grid <- expand.grid(x = 1:10, y = 1:10)
pairs <- subset(grid, x + y > 12 & (x * y) %% 3 == 0)

honor_roll <- Filter(
  Negate(is.null),
  lapply(lines, function(line) {
    parts <- strsplit(line, ",", fixed = TRUE)[[1]]
    score <- as.integer(trimws(parts[2]))
    if (score > 80) {
      list(name = trimws(parts[1]), score = score, grade = "A")
    }
  })
)`,
    java: `import java.util.List;
import java.util.stream.IntStream;

record Pair(int x, int y) {}
record HonorRollEntry(String name, int score, String grade) {}

var lines = List.of("Alice,88", "Bob,72", "Carol,91");

var pairs = IntStream.rangeClosed(1, 10)
    .boxed()
    .flatMap(x -> IntStream.rangeClosed(1, 10)
        .filter(y -> x + y > 12 && (x * y) % 3 == 0)
        .mapToObj(y -> new Pair(x, y)))
    .toList();

var honorRoll = lines.stream()
    .map(line -> line.split(",", 2))
    .map(parts -> new HonorRollEntry(parts[0].trim(), Integer.parseInt(parts[1].trim()), "A"))
    .filter(entry -> entry.score() > 80)
    .toList();`,
    racket: `#lang racket
(require racket/list)

(define lines '("Alice,88" "Bob,72" "Carol,91"))

(define pairs
  (for*/list ([x (in-range 1 11)]
              [y (in-range 1 11)]
              #:when (> (+ x y) 12)
              #:when (zero? (remainder (* x y) 3)))
    (list x y)))

(define honor-roll
  (for/list ([line lines]
             #:do [(define parts (string-split line ","))
                   (define score (string->number (second parts)))]
             #:when (> score 80))
    (hash 'name (string-trim (first parts))
          'score score
          'grade "A")))`,
    scala: `val lines = List("Alice,88", "Bob,72", "Carol,91")

case class HonorRollEntry(name: String, score: Int, grade: String = "A")

val pairs =
  for
    x <- 1 to 10
    y <- 1 to 10
    if x + y > 12
    if (x * y) % 3 == 0
  yield (x, y)

val honorRoll =
  for
    line <- lines
    Array(name, scoreText) = line.split(",", 2)
    score = scoreText.trim.toInt
    if score > 80
  yield HonorRollEntry(name.trim, score)`,
    shell: `lines=("Alice,88" "Bob,72" "Carol,91")
pairs=()
honor_roll=()

for x in {1..10}; do
  for y in {1..10}; do
    if (( x + y > 12 && (x * y) % 3 == 0 )); then
      pairs+=("$x,$y")
    fi
  done
done

for line in "\${lines[@]}"; do
  IFS=, read -r name score_text <<<"$line"
  score=$(printf '%s' "$score_text" | xargs)
  if (( score > 80 )); then
    honor_roll+=("$(printf '%s:%s:A' "$(printf '%s' "$name" | xargs)" "$score")")
  fi
done`,
    cpp: `std::vector<std::string> lines{"Alice,88", "Bob,72", "Carol,91"};
std::vector<std::pair<int, int>> pairs;

for (int x = 1; x <= 10; ++x) {
  for (int y = 1; y <= 10; ++y) {
    if (x + y > 12 && (x * y) % 3 == 0) {
      pairs.emplace_back(x, y);
    }
  }
}

struct HonorRollEntry {
  std::string name;
  int score;
  std::string grade;
};

std::vector<HonorRollEntry> honor_roll;
for (const auto& line : lines) {
  auto comma = line.find(',');
  auto name = trim(line.substr(0, comma));
  auto score = std::stoi(trim(line.substr(comma + 1)));
  if (score > 80) honor_roll.push_back({name, score, "A"});
}`,
    perl: `my @lines = ("Alice,88", "Bob,72", "Carol,91");

my @pairs = map {
  my $x = $_;
  map {
    my $y = $_;
    [$x, $y]
  } grep { $x + $_ > 12 && ($x * $_) % 3 == 0 } 1 .. 10;
} 1 .. 10;

my @honor_roll = grep { defined $_ } map {
  my ($name, $score_text) = split /,/, $_, 2;
  my $score = int($score_text);
  $score > 80 ? { name => $name =~ s/^\s+|\s+$//gr, score => $score, grade => "A" } : undef;
} @lines;`,
    javascript: `const lines = ["Alice,88", "Bob,72", "Carol,91"];

const pairs = Array.from({ length: 10 }, (_, i) => i + 1).flatMap((x) =>
  Array.from({ length: 10 }, (_, i) => i + 1)
    .filter((y) => x + y > 12 && (x * y) % 3 === 0)
    .map((y) => [x, y]),
);

const honorRoll = lines
  .map((line) => {
    const [name, scoreText] = line.split(",", 2);
    return { name: name.trim(), score: Number(scoreText.trim()), grade: "A" };
  })
  .filter((entry) => entry.score > 80);`,
    php: `$lines = ["Alice,88", "Bob,72", "Carol,91"];
$pairs = [];

for ($x = 1; $x <= 10; $x++) {
    for ($y = 1; $y <= 10; $y++) {
        if ($x + $y > 12 && ($x * $y) % 3 === 0) {
            $pairs[] = [$x, $y];
        }
    }
}

$honorRoll = array_values(array_filter(array_map(
    function (string $line): ?array {
        [$name, $scoreText] = explode(',', $line, 2);
        $score = (int) trim($scoreText);
        return $score > 80
            ? ['name' => trim($name), 'score' => $score, 'grade' => 'A']
            : null;
    },
    $lines,
)));`,
    zig: `const std = @import("std");

const lines = [_][]const u8{ "Alice,88", "Bob,72", "Carol,91" };

var pairs = std.ArrayList(struct { i32, i32 }).init(allocator);
for (1..11) |x| {
    for (1..11) |y| {
        if (x + y > 12 and @mod(x * y, 3) == 0) {
            try pairs.append(.{ @intCast(x), @intCast(y) });
        }
    }
}

const HonorRollEntry = struct {
    name: []const u8,
    score: i32,
    grade: []const u8,
};

var honor_roll = std.ArrayList(HonorRollEntry).init(allocator);
for (lines) |line| {
    var parts = std.mem.splitScalar(u8, line, ',');
    const name = std.mem.trim(u8, parts.next().?, " ");
    const score = try std.fmt.parseInt(i32, std.mem.trim(u8, parts.next().?, " "), 10);
    if (score > 80) try honor_roll.append(.{ .name = name, .score = score, .grade = "A" });
}`,
    lean: `def lines := ["Alice,88", "Bob,72", "Carol,91"]

def pairs : List (Nat × Nat) :=
  [ (x, y)
  | x <- List.range 10 |>.map (· + 1)
  , y <- List.range 10 |>.map (· + 1)
  , x + y > 12
  , (x * y) % 3 = 0
  ]

def honorRoll : List (String × Nat × String) :=
  lines.filterMap fun line =>
    match line.splitOn "," with
    | [name, scoreText] =>
        let score := scoreText.trim.toNat!
        if score > 80 then some (name.trim, score, "A") else none
    | _ => none`,
    idris: `lines : List String
lines = ["Alice,88", "Bob,72", "Carol,91"]

pairs : List (Int, Int)
pairs = [ (x, y) | x <- [1..10], y <- [1..10], x + y > 12, mod (x * y) 3 == 0 ]

record HonorRollEntry where
  constructor MkHonorRollEntry
  name : String
  score : Int
  grade : String

honorRoll : List HonorRollEntry
honorRoll = mapMaybe toEntry lines
  where
    toEntry : String -> Maybe HonorRollEntry
    toEntry line =
      case break (== ',') line of
        (name, ',' :: scoreText) =>
          let score = cast (trim scoreText) in
          if score > 80 then Just (MkHonorRollEntry (trim name) score "A") else Nothing
        _ => Nothing`,
    bean: `let lines = ["Alice,88", "Bob,72", "Carol,91"]

type HonorRollEntry = {
  name: String,
  score: Int,
  grade: String,
}

let pairs =
  for x in 1..10,
      y in 1..10,
      if x + y > 12,
      if (x * y) % 3 == 0 {
    (x, y)
  }

let honor_roll =
  lines.filter_map(line => {
    let [name, score_text] = line.split(",", 2)
    let score = score_text.trim().to_int()
    if score > 80 {
      Some({ name: name.trim(), score: score, grade: "A" })
    } else {
      None
    }
  })`,
    mojo: `from collections import List

alias Pair = Tuple[Int, Int]
struct HonorRollEntry:
    var name: String
    var score: Int
    var grade: String

let lines = List[String]("Alice,88", "Bob,72", "Carol,91")
var pairs = List[Pair]()
for x in range(1, 11):
    for y in range(1, 11):
        if x + y > 12 and (x * y) % 3 == 0:
            pairs.append((x, y))

var honor_roll = List[HonorRollEntry]()
for line in lines:
    let parts = line.split(",", maxsplit=1)
    let score = Int(parts[1].strip())
    if score > 80:
        honor_roll.append(HonorRollEntry(parts[0].strip(), score, "A"))`,
    c: `typedef struct {
  char name[32];
  int score;
  char grade;
} HonorRollEntry;

int pairs[100][2];
int pair_count = 0;

for (int x = 1; x <= 10; ++x) {
  for (int y = 1; y <= 10; ++y) {
    if (x + y > 12 && (x * y) % 3 == 0) {
      pairs[pair_count][0] = x;
      pairs[pair_count][1] = y;
      pair_count++;
    }
  }
}

HonorRollEntry honor_roll[3];
int honor_count = 0;
for (size_t i = 0; i < line_count; ++i) {
  char name[32];
  int score = 0;
  sscanf(lines[i], "%31[^,],%d", name, &score);
  if (score > 80) {
    honor_roll[honor_count++] = (HonorRollEntry){ .name = "", .score = score, .grade = 'A' };
    strcpy(honor_roll[honor_count - 1].name, trim(name));
  }
}`,
    d: `import std.algorithm : filter, map;
import std.array : array;
import std.conv : to;
import std.string : split, strip;

auto lines = ["Alice,88", "Bob,72", "Carol,91"];

auto pairs = [
  tuple(x, y)
  foreach (x; 1 .. 11)
  foreach (y; 1 .. 11)
  if (x + y > 12 && (x * y) % 3 == 0)
];

struct HonorRollEntry {
  string name;
  int score;
  string grade;
}

auto honorRoll = lines
  .map!(line => line.split(",", 2))
  .map!(parts => HonorRollEntry(parts[0].strip, parts[1].strip.to!int, "A"))
  .filter!(entry => entry.score > 80)
  .array;`,
    moonbit: `let lines = ["Alice,88", "Bob,72", "Carol,91"]

type HonorRollEntry = {
  name : String,
  score : Int,
  grade : String,
}

let pairs = [
  (x, y)
  for x in 1..10
  for y in 1..10
  if x + y > 12
  if (x * y) % 3 == 0
]

let honor_roll = lines.filter_map(line => {
  let parts = line.split(",", 2)
  let score = parts[1].trim().to_int()
  if score > 80 {
    Some({ name: parts[0].trim(), score: score, grade: "A" })
  } else {
    None
  }
})`,
    fsharp: `let lines = [ "Alice,88"; "Bob,72"; "Carol,91" ]

type HonorRollEntry = {
  Name: string
  Score: int
  Grade: string
}

let pairs =
  [ for x in 1 .. 10 do
      for y in 1 .. 10 do
        if x + y > 12 && (x * y) % 3 = 0 then
          yield x, y ]

let honorRoll =
  [ for line in lines do
      let parts = line.Split(',', 2)
      let score = int (parts[1].Trim())
      if score > 80 then
        yield { Name = parts[0].Trim(); Score = score; Grade = "A" } ]`,
    clojure: `(def lines ["Alice,88" "Bob,72" "Carol,91"])

(def pairs
  (for [x (range 1 11)
        y (range 1 11)
        :when (> (+ x y) 12)
        :when (zero? (mod (* x y) 3))]
    [x y]))

(def honor-roll
  (for [line lines
        :let [[name score-text] (clojure.string/split line #"," 2)
              score (Integer/parseInt (clojure.string/trim score-text))]
        :when (> score 80)]
    {:name (clojure.string/trim name)
     :score score
     :grade "A"}))`,
    erlang: `Lines = ["Alice,88", "Bob,72", "Carol,91"],
Pairs = [{X, Y} ||
  X <- lists:seq(1, 10),
  Y <- lists:seq(1, 10),
  X + Y > 12,
  (X * Y) rem 3 =:= 0
],
HonorRoll = [
  #{name => string:trim(Name), score => Score, grade => "A"}
 || Line <- Lines,
    [Name, ScoreText] <- [string:split(Line, ",", all)],
    Score <- [list_to_integer(string:trim(ScoreText))],
    Score > 80
].`,
    gleam: `import gleam/int
import gleam/list
import gleam/result
import gleam/string

pub type HonorRollEntry {
  HonorRollEntry(name: String, score: Int, grade: String)
}

let lines = ["Alice,88", "Bob,72", "Carol,91"]

let pairs =
  list.flat_map(list.range(1, 10), fn(x) {
    list.filter_map(list.range(1, 10), fn(y) {
      if x + y > 12 && int.mod(x * y, 3) == 0 {
        Ok(#(x, y))
      } else {
        Error(Nil)
      }
    })
  })

let honor_roll =
  list.filter_map(lines, fn(line) {
    case string.split(line, ",") {
      [name, score_text] ->
        let score = score_text |> string.trim |> int.parse |> result.unwrap(0)
        if score > 80 {
          Ok(HonorRollEntry(string.trim(name), score, "A"))
        } else {
          Error(Nil)
        }
      _ -> Error(Nil)
    }
  })`,
    haskell: `lines' :: [String]
lines' = ["Alice,88", "Bob,72", "Carol,91"]

pairs :: [(Int, Int)]
pairs =
  [ (x, y)
  | x <- [1 .. 10]
  , y <- [1 .. 10]
  , x + y > 12
  , (x * y) \`mod\` 3 == 0
  ]

data HonorRollEntry = HonorRollEntry
  { name :: String
  , score :: Int
  , grade :: String
  }

honorRoll :: [HonorRollEntry]
honorRoll =
  [ HonorRollEntry (trim name) score "A"
  | line <- lines'
  , let (name, scoreText0) = break (== ',') line
  , let score = read (trim (drop 1 scoreText0))
  , score > 80
  ]`,
    lisp: `(defparameter *lines* '("Alice,88" "Bob,72" "Carol,91"))

(defstruct honor-roll-entry name score grade)

(defparameter *pairs*
  (loop for x from 1 to 10 append
    (loop for y from 1 to 10
          when (and (> (+ x y) 12)
                    (zerop (mod (* x y) 3)))
          collect (list x y))))

(defparameter *honor-roll*
  (loop for line in *lines*
        for parts = (uiop:split-string line :separator ",")
        for score = (parse-integer (string-trim '(#\Space) (second parts)))
        when (> score 80)
        collect (make-honor-roll-entry
                 :name (string-trim '(#\Space) (first parts))
                 :score score
                 :grade "A")))`,
    lua: `local lines = { "Alice,88", "Bob,72", "Carol,91" }
local pairs = {}

for x = 1, 10 do
  for y = 1, 10 do
    if x + y > 12 and (x * y) % 3 == 0 then
      table.insert(pairs, { x, y })
    end
  end
end

local honor_roll = {}
for _, line in ipairs(lines) do
  local name, score_text = line:match("^([^,]+),(.+)$")
  local score = tonumber((score_text:gsub("^%s+", ""):gsub("%s+$", "")))
  if score > 80 then
    table.insert(honor_roll, { name = name:match("^%s*(.-)%s*$"), score = score, grade = "A" })
  end
end`,
    prose: `pairs = every (x, y) where x is 1..10 and y is 1..10 and x + y > 12 and (x * y) mod 3 = 0

for each line in ["Alice,88", "Bob,72", "Carol,91"]:
  split line into name and score_text
  let score = integer(trim(score_text))
  if score > 80:
    emit { name: trim(name), score: score, grade: "A" }`,
    agda: `open import Data.List
open import Data.String
open import Data.Nat

pairs : List (Nat × Nat)
pairs =
  [ (x , y)
  | x <- 1 ∷ 2 ∷ 3 ∷ 4 ∷ 5 ∷ 6 ∷ 7 ∷ 8 ∷ 9 ∷ 10 ∷ []
  , y <- 1 ∷ 2 ∷ 3 ∷ 4 ∷ 5 ∷ 6 ∷ 7 ∷ 8 ∷ 9 ∷ 10 ∷ []
  , x + y > 12
  , (x * y) mod 3 ≡ 0
  ]

honorRoll : List (String × Nat × String)
honorRoll =
  mapMaybe parseHonor ("Alice,88" ∷ "Bob,72" ∷ "Carol,91" ∷ [])`,
    coq: `Definition pairs : list (nat * nat) :=
  flat_map
    (fun x =>
      filter
        (fun '(x, y) => (12 <? x + y) && Nat.eqb ((x * y) mod 3) 0)
        (map (fun y => (x, y)) (seq 1 10)))
    (seq 1 10).

Definition honor_roll_line (line : string) : option (string * nat * string) :=
  let '(name, score_text) := split_once "," line in
  let score := parse_nat (trim score_text) in
  if 80 <? score then Some (trim name, score, "A") else None.

Definition honor_roll := mapMaybe honor_roll_line ["Alice,88"; "Bob,72"; "Carol,91"].`,
    dream: `let lines = ["Alice,88", "Bob,72", "Carol,91"]

let pairs =
  [
    (x, y)
    for x in 1..10
    for y in 1..10
    if x + y > 12
    if (x * y) % 3 == 0
  ]

let honor_roll =
  [
    {
      name: name.trim(),
      score: score,
      grade: "A",
    }
    for line in lines
    let [name, score_text] = line.split(",", limit: 2)
    let score = Int.parse(score_text.trim())
    if score > 80
  ]`,
  },
};
