// Built-in formatter: dart format .
typedef User = ({
  String name,
  String email,
  bool isAdmin,
  List<String> tags,
});

User buildUser(String name, String email, bool isAdmin) => (
  name: name.trim(),
  email: email.trim().toLowerCase(),
  isAdmin: isAdmin,
  tags: ['active', isAdmin ? 'staff' : 'member'],
);
