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
  return err("invalid_email") unless $new_email =~ /\@/;
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
    moonbit: `// Canonical formatter: moon fmt
fn build_user(name : String, email : String, admin : Bool) -> User {
  {
    name: name.trim(),
    email: email.trim().lowercase(),
    admin: admin,
    tags: ["active", if admin { "staff" } else { "member" }],
  }
}`,
    gleam: `// Canonical formatter: gleam format
pub fn build_user(name: String, email: String, admin: Bool) -> User {
  User(
    name: string.trim(name),
    email: string.lowercase(string.trim(email)),
    admin: admin,
    tags: ["active", if admin { "staff" } else { "member" }],
  )
}`,
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
    moonbit: `/// Safely adds two integers.
/// 
/// # Examples
/// safe_add(1, 2) == Ok(3)
/// safe_add(9_999_999_999, 1) == Err(Overflow)
fn safe_add(a : Int, b : Int) -> Result[Int, AddError] { ... }`,
    gleam: `/// Safely adds two integers.
///
/// \`\`\`gleam
/// safe_add(1, 2)
/// // -> Ok(3)
/// \`\`\`
pub fn safe_add(a: Int, b: Int) -> Result(Int, AddError) { ... }`,
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
  },
  "pipe-operator": {
    rust: `let revenue = orders
    .iter()
    .filter(|order| order.status == Status::Completed)
    .map(|order| order.total)
    .sum::<f64>();

let revenue_with_tax = (revenue * 1.10 * 100.0).round() / 100.0;`,
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
  },
} satisfies Record<string, Partial<Record<LangId, string>>>;
