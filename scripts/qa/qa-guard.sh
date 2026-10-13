# Gardes de chemin communes à rebuild-vps.sh et root-tests.sh (à sourcer, pas à exécuter).
# Ces scripts effacent leur dossier de sortie : une faute de frappe ou une variable vide
# (« /home/user/$DIR » → « /home/user/ ») ne doit jamais emporter le dépôt, ses commits locaux non
# poussés ou le node_modules partagé par tous les lots.
#   qa_guard_out <dépôt> <sortie> <dépendances>  : quitte avec le code 2 si la sortie est dangereuse ;
#   qa_mark_out <sortie>                          : pose le marqueur après création.
QA_MARK=.smartfixx-qa-build
qa_guard_out() {
  local repo=$1 out=$2 deps=$3
  case "$out" in /|/home|/root|/tmp|/usr|/usr/*|/etc|/etc/*|/opt|/var) echo "Sortie refusée : $out." >&2; exit 2;; esac
  [ "$(printf '%s' "$out" | tr -cd / | wc -c)" -ge 3 ] || { echo "Sortie refusée (trop proche de la racine) : $out." >&2; exit 2; }
  case "$out/" in "$repo"/*) echo "La sortie doit être hors du dépôt." >&2; exit 2;; esac
  case "$repo/" in "$out"/*) echo "La sortie ne doit pas contenir le dépôt ($repo)." >&2; exit 2;; esac
  case "$out/" in "$deps"/*) echo "La sortie ne doit pas être dans $deps." >&2; exit 2;; esac
  case "$deps/" in "$out"/*) echo "La sortie ne doit pas contenir $deps." >&2; exit 2;; esac
  if [ -e "$out" ] && [ ! -d "$out" ]; then echo "La sortie existe et n'est pas un dossier : $out." >&2; exit 2; fi
  if [ -d "$out" ] && [ -n "$(ls -A "$out" 2>/dev/null)" ] && [ ! -f "$out/$QA_MARK" ]; then
    echo "La sortie $out existe, n'est pas vide et n'a pas été créée par scripts/qa (marqueur $QA_MARK absent)." >&2
    echo "Choisissez un dossier neuf, ou supprimez-le vous-même après avoir vérifié son contenu." >&2
    exit 2
  fi
  if [ -e "$out/.git" ]; then echo "La sortie contient un dépôt git : refusée." >&2; exit 2; fi
}
qa_mark_out() { printf 'Dossier de construction jetable créé par scripts/qa le %s.\n' "$(date -Iseconds)" >"$1/$QA_MARK"; }
